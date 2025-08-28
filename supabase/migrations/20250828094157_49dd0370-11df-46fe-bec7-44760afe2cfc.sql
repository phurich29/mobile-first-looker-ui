-- แก้ไข check_notification_thresholds function ให้รองรับ user-specific notifications
CREATE OR REPLACE FUNCTION public.check_notification_thresholds()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  look_back_seconds INT := 30;
  current_ts TIMESTAMP := now();
  cutoff_ts TIMESTAMP := current_ts - (look_back_seconds || ' seconds')::INTERVAL;
  setting RECORD;
  analysis RECORD;
  notification_exists BOOLEAN;
  notification_id UUID;
  exceeded_value NUMERIC;
  message TEXT;
  threshold_type TEXT;
  check_count INT := 0;
  notification_count INT := 0;
BEGIN
  RAISE NOTICE 'Starting check_notification_thresholds at %', current_ts;
  RAISE NOTICE 'Looking back % seconds to %', look_back_seconds, cutoff_ts;
  
  -- Loop through all active notification settings (now with user_id)
  FOR setting IN 
    SELECT * FROM notification_settings 
    WHERE enabled = true 
    AND (min_enabled = true OR max_enabled = true)
    AND user_id IS NOT NULL -- Only process settings with valid user_id
  LOOP
    check_count := check_count + 1;
    RAISE NOTICE 'Checking setting: device=%, type=%, user_id=%, min=%, max=%', 
      setting.device_code, setting.rice_type_id, setting.user_id, setting.min_threshold, setting.max_threshold;
    
    -- For each setting, check recent data in rice_quality_analysis
    FOR analysis IN
      SELECT * FROM rice_quality_analysis
      WHERE device_code = setting.device_code
        AND created_at BETWEEN cutoff_ts AND current_ts
        AND (
          CASE 
            WHEN setting.rice_type_id = 'whiteness' THEN whiteness IS NOT NULL
            WHEN setting.rice_type_id = 'head_rice' THEN head_rice IS NOT NULL
            WHEN setting.rice_type_id = 'whole_kernels' THEN whole_kernels IS NOT NULL
            WHEN setting.rice_type_id = 'imperfection_rate' THEN imperfection_rate IS NOT NULL
            WHEN setting.rice_type_id = 'small_brokens' THEN small_brokens IS NOT NULL
            WHEN setting.rice_type_id = 'small_brokens_c1' THEN small_brokens_c1 IS NOT NULL
            WHEN setting.rice_type_id = 'total_brokens' THEN total_brokens IS NOT NULL
            WHEN setting.rice_type_id = 'paddy_rate' THEN paddy_rate IS NOT NULL
            WHEN setting.rice_type_id = 'yellow_rice_rate' THEN yellow_rice_rate IS NOT NULL
            WHEN setting.rice_type_id = 'sticky_rice_rate' THEN sticky_rice_rate IS NOT NULL
            WHEN setting.rice_type_id = 'red_line_rate' THEN red_line_rate IS NOT NULL
            WHEN setting.rice_type_id = 'honey_rice' THEN honey_rice IS NOT NULL
            WHEN setting.rice_type_id = 'black_kernel' THEN black_kernel IS NOT NULL
            WHEN setting.rice_type_id = 'partly_black' THEN partly_black IS NOT NULL
            WHEN setting.rice_type_id = 'partly_black_peck' THEN partly_black_peck IS NOT NULL
            WHEN setting.rice_type_id = 'short_grain' THEN short_grain IS NOT NULL
            WHEN setting.rice_type_id = 'slender_kernel' THEN slender_kernel IS NOT NULL
            WHEN setting.rice_type_id = 'parboiled_white_rice' THEN parboiled_white_rice IS NOT NULL
            WHEN setting.rice_type_id = 'parboiled_red_line' THEN parboiled_red_line IS NOT NULL
            WHEN setting.rice_type_id = 'class1' THEN class1 IS NOT NULL
            WHEN setting.rice_type_id = 'class2' THEN class2 IS NOT NULL
            WHEN setting.rice_type_id = 'class3' THEN class3 IS NOT NULL
            ELSE false
          END
        )
    LOOP
      RAISE NOTICE 'Found analysis data id=% for device=% at %', 
        analysis.id, analysis.device_code, analysis.created_at;
        
      -- Get the actual value from the analysis based on rice_type_id
      exceeded_value := CASE
        WHEN setting.rice_type_id = 'whiteness' THEN analysis.whiteness
        WHEN setting.rice_type_id = 'head_rice' THEN analysis.head_rice
        WHEN setting.rice_type_id = 'whole_kernels' THEN analysis.whole_kernels
        WHEN setting.rice_type_id = 'imperfection_rate' THEN analysis.imperfection_rate
        WHEN setting.rice_type_id = 'small_brokens' THEN analysis.small_brokens
        WHEN setting.rice_type_id = 'small_brokens_c1' THEN analysis.small_brokens_c1
        WHEN setting.rice_type_id = 'total_brokens' THEN analysis.total_brokens
        WHEN setting.rice_type_id = 'paddy_rate' THEN analysis.paddy_rate
        WHEN setting.rice_type_id = 'yellow_rice_rate' THEN analysis.yellow_rice_rate
        WHEN setting.rice_type_id = 'sticky_rice_rate' THEN analysis.sticky_rice_rate
        WHEN setting.rice_type_id = 'red_line_rate' THEN analysis.red_line_rate
        WHEN setting.rice_type_id = 'honey_rice' THEN analysis.honey_rice
        WHEN setting.rice_type_id = 'black_kernel' THEN analysis.black_kernel
        WHEN setting.rice_type_id = 'partly_black' THEN analysis.partly_black
        WHEN setting.rice_type_id = 'partly_black_peck' THEN analysis.partly_black_peck
        WHEN setting.rice_type_id = 'short_grain' THEN analysis.short_grain
        WHEN setting.rice_type_id = 'slender_kernel' THEN analysis.slender_kernel
        WHEN setting.rice_type_id = 'parboiled_white_rice' THEN analysis.parboiled_white_rice
        WHEN setting.rice_type_id = 'parboiled_red_line' THEN analysis.parboiled_red_line
        WHEN setting.rice_type_id = 'class1' THEN analysis.class1
        WHEN setting.rice_type_id = 'class2' THEN analysis.class2
        WHEN setting.rice_type_id = 'class3' THEN analysis.class3
        ELSE NULL
      END;
      
      IF exceeded_value IS NULL THEN
        RAISE NOTICE 'Value is NULL, skipping';
        CONTINUE;
      END IF;
      
      -- Check if the value exceeds min threshold
      IF setting.min_enabled = true AND exceeded_value < setting.min_threshold THEN
        threshold_type := 'min';
        message := 'ค่า "' || setting.rice_type_name || '" (' || exceeded_value || ') ต่ำกว่าเกณฑ์ที่กำหนดไว้ (' || setting.min_threshold || ')';
        RAISE NOTICE 'MIN THRESHOLD BREACH: device=%, type=%, value=%, threshold=%, user_id=%', 
          setting.device_code, setting.rice_type_id, exceeded_value, setting.min_threshold, setting.user_id;
        
        -- Check if the notification already exists for this condition AND user
        SELECT COUNT(*) > 0, MAX(id) INTO notification_exists, notification_id
        FROM notifications
        WHERE device_code = setting.device_code
          AND rice_type_id = setting.rice_type_id
          AND threshold_type = threshold_type
          AND user_id = setting.user_id  -- ⭐ CRITICAL: ตรวจสอบ user_id
          AND abs(value - exceeded_value) < 0.001
          AND timestamp > current_ts - INTERVAL '1 day';
          
        IF notification_exists THEN
          -- Update existing notification counter
          UPDATE notifications
          SET notification_count = notification_count + 1,
              timestamp = current_ts,
              notification_message = message
          WHERE id = notification_id;
          RAISE NOTICE 'Updated existing notification: id=%', notification_id;
        ELSE
          -- Create a new notification with user_id
          INSERT INTO notifications (
            device_code, rice_type_id, threshold_type, value, 
            notification_message, timestamp, analysis_id, user_id
          )
          VALUES (
            setting.device_code, setting.rice_type_id, threshold_type, 
            exceeded_value, message, current_ts, analysis.id, setting.user_id
          );
          notification_count := notification_count + 1;
          RAISE NOTICE 'Created new MIN notification for device=%, type=%, user_id=%', 
            setting.device_code, setting.rice_type_id, setting.user_id;
        END IF;
      END IF;
      
      -- Check if the value exceeds max threshold
      IF setting.max_enabled = true AND exceeded_value > setting.max_threshold THEN
        threshold_type := 'max';
        message := 'ค่า "' || setting.rice_type_name || '" (' || exceeded_value || ') สูงกว่าเกณฑ์ที่กำหนดไว้ (' || setting.max_threshold || ')';
        RAISE NOTICE 'MAX THRESHOLD BREACH: device=%, type=%, value=%, threshold=%, user_id=%', 
          setting.device_code, setting.rice_type_id, exceeded_value, setting.max_threshold, setting.user_id;
        
        -- Check if the notification already exists for this condition AND user
        SELECT COUNT(*) > 0, MAX(id) INTO notification_exists, notification_id
        FROM notifications
        WHERE device_code = setting.device_code
          AND rice_type_id = setting.rice_type_id
          AND threshold_type = threshold_type
          AND user_id = setting.user_id  -- ⭐ CRITICAL: ตรวจสอบ user_id
          AND abs(value - exceeded_value) < 0.001
          AND timestamp > current_ts - INTERVAL '1 day';
          
        IF notification_exists THEN
          -- Update existing notification counter
          UPDATE notifications
          SET notification_count = notification_count + 1,
              timestamp = current_ts,
              notification_message = message
          WHERE id = notification_id;
          RAISE NOTICE 'Updated existing notification: id=%', notification_id;
        ELSE
          -- Create a new notification with user_id
          INSERT INTO notifications (
            device_code, rice_type_id, threshold_type, value, 
            notification_message, timestamp, analysis_id, user_id
          )
          VALUES (
            setting.device_code, setting.rice_type_id, threshold_type, 
            exceeded_value, message, current_ts, analysis.id, setting.user_id
          );
          notification_count := notification_count + 1;
          RAISE NOTICE 'Created new MAX notification for device=%, type=%, user_id=%', 
            setting.device_code, setting.rice_type_id, setting.user_id;
        END IF;
      END IF;
    END LOOP;
  END LOOP;
  
  -- Log function execution summary
  RAISE NOTICE 'Completed check_notification_thresholds: checked % settings, created/updated % notifications', 
    check_count, notification_count;
END;
$function$;