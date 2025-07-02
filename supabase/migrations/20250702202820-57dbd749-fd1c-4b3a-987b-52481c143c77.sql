-- Update get_devices_with_details function to query all unique devices and exclude unwanted ones
CREATE OR REPLACE FUNCTION public.get_devices_with_details(user_id_param text DEFAULT NULL::text, is_admin_param boolean DEFAULT false, is_superadmin_param boolean DEFAULT false)
 RETURNS TABLE(device_code text, display_name text, updated_at timestamp without time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  excluded_devices TEXT[] := ARRAY[
    '6000306302140',
    '6000306302141', 
    '6000306302143',
    '6000306302144'
  ];
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
END;
$function$;