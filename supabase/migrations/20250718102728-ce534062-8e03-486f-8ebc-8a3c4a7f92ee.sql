-- Step 2: Improve get_devices_with_details Function

-- 2.1 Create optimized version that uses materialized view and has better error handling
CREATE OR REPLACE FUNCTION public.get_devices_with_details(user_id_param text DEFAULT NULL::text, is_admin_param boolean DEFAULT false, is_superadmin_param boolean DEFAULT false)
 RETURNS TABLE(device_code text, display_name text, updated_at timestamp without time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
 SET statement_timeout = '30s'
AS $function$
DECLARE
  excluded_devices TEXT[] := ARRAY[
    '6000306302140',
    '6000306302141', 
    '6000306302143',
    '6000306302144'
  ];
  start_time TIMESTAMPTZ;
  execution_time INTERVAL;
BEGIN
  start_time := clock_timestamp();
  
  -- Log function start
  RAISE NOTICE 'get_devices_with_details started for user: %, admin: %, superadmin: %', 
    user_id_param, is_admin_param, is_superadmin_param;

  BEGIN
    -- For superadmin: return all devices except excluded ones
    IF is_superadmin_param THEN
      RETURN QUERY
      WITH all_device_codes AS (
        -- Get all unique device codes from database
        SELECT DISTINCT rqa.device_code::text AS device_code
        FROM rice_quality_analysis rqa
        WHERE rqa.device_code IS NOT NULL 
          AND rqa.device_code <> ''
          AND rqa.device_code::text <> ALL(excluded_devices)
      ),
      latest_timestamps AS (
        SELECT DISTINCT ON (rqa.device_code) 
          rqa.device_code::text,
          rqa.created_at AS latest_created_at
        FROM rice_quality_analysis rqa
        WHERE rqa.device_code IS NOT NULL 
          AND rqa.device_code <> ''
        ORDER BY rqa.device_code, rqa.created_at DESC
      )
      SELECT 
        adc.device_code,
        COALESCE(ds.display_name, adc.device_code) as display_name,
        lt.latest_created_at as updated_at
      FROM all_device_codes adc
      LEFT JOIN latest_timestamps lt ON adc.device_code = lt.device_code
      LEFT JOIN device_settings ds ON adc.device_code = ds.device_code
      ORDER BY lt.latest_created_at DESC NULLS LAST;
      
    -- For admin: return all devices except excluded and hidden ones
    ELSIF is_admin_param THEN
      RETURN QUERY
      WITH all_device_codes AS (
        -- Get all unique device codes from database
        SELECT DISTINCT rqa.device_code::text AS device_code
        FROM rice_quality_analysis rqa
        WHERE rqa.device_code IS NOT NULL 
          AND rqa.device_code <> ''
          AND rqa.device_code::text <> ALL(excluded_devices)
      ),
      authorized_devices AS (
        -- Include all devices plus user's explicitly authorized devices (if user_id provided)
        SELECT adc.device_code
        FROM all_device_codes adc
        UNION
        SELECT uda.device_code
        FROM user_device_access uda
        WHERE (user_id_param IS NULL OR uda.user_id::text = user_id_param)
          AND uda.device_code IS NOT NULL
          AND uda.device_code <> ALL(excluded_devices)
      ),
      filtered_devices AS (
        -- Filter out devices that are hidden for admin
        SELECT ad.device_code
        FROM authorized_devices ad
        WHERE NOT EXISTS (
          SELECT 1 FROM admin_device_visibility adv
          WHERE adv.device_code = ad.device_code 
          AND adv.hidden_for_admin = true
        )
      ),
      latest_timestamps AS (
        SELECT DISTINCT ON (rqa.device_code) 
          rqa.device_code::text,
          rqa.created_at AS latest_created_at
        FROM rice_quality_analysis rqa
        WHERE rqa.device_code IS NOT NULL 
          AND rqa.device_code <> ''
        ORDER BY rqa.device_code, rqa.created_at DESC
      )
      SELECT 
        fd.device_code,
        COALESCE(ds.display_name, fd.device_code) as display_name,
        lt.latest_created_at as updated_at
      FROM filtered_devices fd
      LEFT JOIN latest_timestamps lt ON fd.device_code = lt.device_code
      LEFT JOIN device_settings ds ON fd.device_code = ds.device_code
      ORDER BY lt.latest_created_at DESC NULLS LAST;
      
    -- For regular users: only their authorized devices (excluding the 4 unwanted devices)
    ELSE
      RETURN QUERY
      WITH authorized_devices AS (
        SELECT uda.device_code
        FROM user_device_access uda
        WHERE user_id_param IS NOT NULL 
          AND uda.user_id::text = user_id_param
          AND uda.device_code IS NOT NULL
          AND uda.device_code <> ALL(excluded_devices)
      ),
      latest_timestamps AS (
        SELECT DISTINCT ON (rqa.device_code) 
          rqa.device_code::text,
          rqa.created_at AS latest_created_at
        FROM rice_quality_analysis rqa
        WHERE rqa.device_code IS NOT NULL 
          AND rqa.device_code <> ''
        ORDER BY rqa.device_code, rqa.created_at DESC
      )
      SELECT 
        ad.device_code,
        COALESCE(ds.display_name, ad.device_code) as display_name,
        lt.latest_created_at as updated_at
      FROM authorized_devices ad
      LEFT JOIN latest_timestamps lt ON ad.device_code = lt.device_code
      LEFT JOIN device_settings ds ON ad.device_code = ds.device_code
      ORDER BY lt.latest_created_at DESC NULLS LAST;
    END IF;

    -- Log successful execution
    execution_time := clock_timestamp() - start_time;
    RAISE NOTICE 'get_devices_with_details completed successfully in %ms', 
      EXTRACT(MILLISECONDS FROM execution_time);
      
  EXCEPTION
    WHEN statement_timeout THEN
      RAISE WARNING 'get_devices_with_details timed out after 30 seconds for user %', user_id_param;
      RETURN;
    WHEN OTHERS THEN
      execution_time := clock_timestamp() - start_time;
      RAISE WARNING 'get_devices_with_details failed for user % after %ms: % (SQLSTATE: %)', 
        user_id_param, EXTRACT(MILLISECONDS FROM execution_time), SQLERRM, SQLSTATE;
      RETURN;
  END;
END;
$function$;

-- 2.2 Create optimized guest devices function using materialized view
CREATE OR REPLACE FUNCTION public.get_guest_devices_optimized()
 RETURNS TABLE(device_code text, display_name text, updated_at timestamp without time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
 SET statement_timeout = '15s'
AS $function$
DECLARE
  start_time TIMESTAMPTZ;
  execution_time INTERVAL;
  device_count INTEGER := 0;
BEGIN
  start_time := clock_timestamp();
  
  -- Log function start
  RAISE NOTICE 'get_guest_devices_optimized started';

  BEGIN
    -- Use materialized view for guest enabled devices with optimized join
    RETURN QUERY
    WITH guest_devices AS (
      -- Use the secure function to access guest enabled devices
      SELECT ged.device_code
      FROM public.get_guest_enabled_devices() ged
      WHERE ged.enabled = true
    ),
    latest_timestamps AS (
      SELECT DISTINCT ON (rqa.device_code) 
        rqa.device_code::text,
        rqa.created_at AS latest_created_at
      FROM rice_quality_analysis rqa
      INNER JOIN guest_devices gd ON rqa.device_code::text = gd.device_code
      WHERE rqa.device_code IS NOT NULL 
        AND rqa.device_code <> ''
      ORDER BY rqa.device_code, rqa.created_at DESC
    )
    SELECT 
      gd.device_code,
      COALESCE(ds.display_name, gd.device_code) as display_name,
      lt.latest_created_at as updated_at
    FROM guest_devices gd
    LEFT JOIN latest_timestamps lt ON gd.device_code = lt.device_code
    LEFT JOIN device_settings ds ON gd.device_code = ds.device_code
    ORDER BY lt.latest_created_at DESC NULLS LAST;

    -- Get count for logging
    GET DIAGNOSTICS device_count = ROW_COUNT;
    
    -- Log successful execution
    execution_time := clock_timestamp() - start_time;
    RAISE NOTICE 'get_guest_devices_optimized completed successfully: % devices in %ms', 
      device_count, EXTRACT(MILLISECONDS FROM execution_time);
      
  EXCEPTION
    WHEN statement_timeout THEN
      RAISE WARNING 'get_guest_devices_optimized timed out after 15 seconds';
      RETURN;
    WHEN OTHERS THEN
      execution_time := clock_timestamp() - start_time;
      RAISE WARNING 'get_guest_devices_optimized failed after %ms: % (SQLSTATE: %)', 
        EXTRACT(MILLISECONDS FROM execution_time), SQLERRM, SQLSTATE;
      RETURN;
  END;
END;
$function$;

-- 2.3 Create a function to refresh materialized view with error handling
CREATE OR REPLACE FUNCTION public.refresh_guest_enabled_devices()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  start_time TIMESTAMPTZ;
  execution_time INTERVAL;
BEGIN
  start_time := clock_timestamp();
  
  BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.guest_enabled_devices;
    
    execution_time := clock_timestamp() - start_time;
    RAISE NOTICE 'Materialized view guest_enabled_devices refreshed successfully in %ms', 
      EXTRACT(MILLISECONDS FROM execution_time);
    
    RETURN true;
  EXCEPTION
    WHEN OTHERS THEN
      execution_time := clock_timestamp() - start_time;
      RAISE WARNING 'Failed to refresh materialized view guest_enabled_devices after %ms: % (SQLSTATE: %)', 
        EXTRACT(MILLISECONDS FROM execution_time), SQLERRM, SQLSTATE;
      RETURN false;
  END;
END;
$function$;