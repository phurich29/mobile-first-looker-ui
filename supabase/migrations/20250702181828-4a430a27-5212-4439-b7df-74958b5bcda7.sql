-- Update get_devices_with_details function to respect admin_device_visibility
CREATE OR REPLACE FUNCTION public.get_devices_with_details(user_id_param text DEFAULT NULL::text, is_admin_param boolean DEFAULT false, is_superadmin_param boolean DEFAULT false)
 RETURNS TABLE(device_code text, display_name text, updated_at timestamp without time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  required_devices TEXT[] := ARRAY[
    '6000306302144',
    '6000306302140', 
    '6400000401493',
    '6000306302141',
    '6400000401483',
    '6400000401398',
    '6400000401503'
  ];
BEGIN
  -- For superadmin: return all devices (required + additional from database)
  IF is_superadmin_param THEN
    RETURN QUERY
    WITH all_device_codes AS (
      -- Required devices
      SELECT unnest(required_devices) AS device_code
      UNION
      -- Additional devices from database
      SELECT DISTINCT rqa.device_code::text
      FROM rice_quality_analysis rqa
      WHERE rqa.device_code IS NOT NULL 
        AND rqa.device_code <> ''
        AND rqa.device_code::text <> ALL(required_devices)
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
    
  -- For admin: return required devices + user's additional devices, but exclude hidden devices
  ELSIF is_admin_param THEN
    RETURN QUERY
    WITH authorized_devices AS (
      -- Required devices for admin
      SELECT unnest(required_devices) AS device_code
      UNION
      -- User's explicitly authorized devices (if user_id provided)
      SELECT uda.device_code
      FROM user_device_access uda
      WHERE (user_id_param IS NULL OR uda.user_id::text = user_id_param)
        AND uda.device_code IS NOT NULL
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
    
  -- For regular users: only their authorized devices
  ELSE
    RETURN QUERY
    WITH authorized_devices AS (
      SELECT uda.device_code
      FROM user_device_access uda
      WHERE user_id_param IS NOT NULL 
        AND uda.user_id::text = user_id_param
        AND uda.device_code IS NOT NULL
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

-- Ensure all 4 devices are hidden for admin users
DO $$
DECLARE
    superadmin_id UUID;
BEGIN
    -- Get a superadmin user ID
    SELECT ur.user_id INTO superadmin_id
    FROM user_roles ur 
    WHERE ur.role = 'superadmin'::app_role 
    LIMIT 1;
    
    -- If no superadmin found, use the first admin
    IF superadmin_id IS NULL THEN
        SELECT ur.user_id INTO superadmin_id
        FROM user_roles ur 
        WHERE ur.role = 'admin'::app_role 
        LIMIT 1;
    END IF;
    
    -- Insert the device visibility settings for all 4 devices
    INSERT INTO admin_device_visibility (device_code, hidden_for_admin, created_by)
    SELECT device_code, true, superadmin_id
    FROM (
        VALUES 
            ('6000306302140'),
            ('6000306302141'), 
            ('6000306302143'),
            ('6000306302144')
    ) AS devices(device_code)
    ON CONFLICT (device_code) 
    DO UPDATE SET 
        hidden_for_admin = true,
        updated_at = now();
END $$;