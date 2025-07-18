-- 1. เพิ่ม index สำหรับ guest_device_access.enabled
CREATE INDEX IF NOT EXISTS idx_guest_device_access_enabled 
ON guest_device_access (enabled) WHERE enabled = true;

-- 2. เพิ่ม materialized view สำหรับ guest devices (cache ผลลัพธ์)
CREATE MATERIALIZED VIEW guest_enabled_devices AS
SELECT device_code, enabled
FROM guest_device_access 
WHERE enabled = true;

-- Refresh materialized view when guest_device_access changes
CREATE OR REPLACE FUNCTION refresh_guest_enabled_devices()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW guest_enabled_devices;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_refresh_guest_devices
AFTER INSERT OR UPDATE OR DELETE ON guest_device_access
FOR EACH STATEMENT EXECUTE FUNCTION refresh_guest_enabled_devices();

-- 3. ปรับปรุง get_devices_with_details function ให้ใช้ materialized view
CREATE OR REPLACE FUNCTION public.get_devices_with_details_optimized(
  user_id_param text DEFAULT NULL::text, 
  is_admin_param boolean DEFAULT false, 
  is_superadmin_param boolean DEFAULT false
)
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
  -- For superadmin: use optimized query with materialized view
  IF is_superadmin_param THEN
    RETURN QUERY
    WITH all_device_codes AS (
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
      INNER JOIN all_device_codes adc ON rqa.device_code::text = adc.device_code
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
    
  -- For guest access: use materialized view instead of live query
  ELSIF user_id_param IS NULL THEN
    RETURN QUERY
    WITH guest_devices AS (
      SELECT ged.device_code
      FROM guest_enabled_devices ged
    ),
    latest_timestamps AS (
      SELECT DISTINCT ON (rqa.device_code) 
        rqa.device_code::text,
        rqa.created_at AS latest_created_at
      FROM rice_quality_analysis rqa
      INNER JOIN guest_devices gd ON rqa.device_code::text = gd.device_code
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
    
  -- For authenticated users: original logic
  ELSE
    RETURN QUERY
    SELECT 
      uda.device_code,
      COALESCE(ds.display_name, uda.device_code) as display_name,
      rqa.created_at as updated_at
    FROM user_device_access uda
    LEFT JOIN device_settings ds ON uda.device_code = ds.device_code
    LEFT JOIN LATERAL (
      SELECT created_at 
      FROM rice_quality_analysis 
      WHERE device_code::text = uda.device_code 
      ORDER BY created_at DESC 
      LIMIT 1
    ) rqa ON true
    WHERE uda.user_id::text = user_id_param
      AND uda.device_code <> ALL(excluded_devices)
    ORDER BY rqa.created_at DESC NULLS LAST;
  END IF;
END;
$function$

-- 4. สร้าง composite index สำหรับการ query ที่ใช้บ่อย
CREATE INDEX IF NOT EXISTS idx_rice_quality_analysis_device_created_composite 
ON rice_quality_analysis (device_code, created_at DESC) 
WHERE device_code IS NOT NULL AND device_code <> '';

-- Initial refresh of materialized view
REFRESH MATERIALIZED VIEW guest_enabled_devices;