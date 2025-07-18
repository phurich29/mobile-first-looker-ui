-- Phase 4A: แก้ไข duplicate data และสร้าง optimized views

-- 1. สร้าง materialized view โดยจัดการ duplicates
DROP MATERIALIZED VIEW IF EXISTS device_access_summary;

CREATE MATERIALIZED VIEW device_access_summary AS
WITH deduplicated_access AS (
  -- Guest access (no duplicates expected)
  SELECT 
    device_code,
    'guest' as access_type,
    true as enabled,
    'Guest Access' as access_source,
    created_at
  FROM guest_device_access 
  WHERE enabled = true
  
  UNION
  
  -- User access (deduplicated by device_code)
  SELECT DISTINCT ON (uda.device_code)
    uda.device_code,
    'user' as access_type,
    true as enabled,
    CONCAT('User: ', COALESCE(p.email, 'Unknown')) as access_source,
    uda.created_at
  FROM user_device_access uda
  LEFT JOIN profiles p ON p.id = uda.user_id
  ORDER BY uda.device_code, uda.created_at DESC
  
  UNION
  
  -- Admin access (all devices from rice_quality_analysis)
  SELECT DISTINCT
    rqa.device_code::text as device_code,
    'admin' as access_type,
    true as enabled,
    'Admin Access' as access_source,
    MIN(rqa.created_at) as created_at
  FROM rice_quality_analysis rqa
  WHERE rqa.device_code IS NOT NULL 
    AND rqa.device_code <> ''
    AND rqa.device_code::text NOT IN (
      SELECT device_code FROM guest_device_access WHERE enabled = true
    )
  GROUP BY rqa.device_code::text
)
SELECT * FROM deduplicated_access;

-- 2. สร้าง non-unique indexes สำหรับ materialized view
CREATE INDEX IF NOT EXISTS idx_device_access_summary_device_type 
ON device_access_summary(device_code, access_type);

CREATE INDEX IF NOT EXISTS idx_device_access_summary_type 
ON device_access_summary(access_type);

CREATE INDEX IF NOT EXISTS idx_device_access_summary_device 
ON device_access_summary(device_code) WHERE enabled = true;

-- 3. สร้าง device data summary view (simplified)
DROP MATERIALIZED VIEW IF EXISTS device_data_summary;

CREATE MATERIALIZED VIEW device_data_summary AS
SELECT DISTINCT ON (rqa.device_code)
  rqa.device_code::text,
  rqa.created_at as last_updated,
  COALESCE(ds.display_name, rqa.device_code::text) as display_name,
  COALESCE(ds.location, 'ไม่ระบุ') as location,
  CASE 
    WHEN rqa.created_at > now() - INTERVAL '1 hour' THEN 'recent'
    WHEN rqa.created_at > now() - INTERVAL '1 day' THEN 'daily'
    ELSE 'old'
  END as data_freshness
FROM rice_quality_analysis rqa
LEFT JOIN device_settings ds ON ds.device_code = rqa.device_code::text
WHERE rqa.device_code IS NOT NULL 
  AND rqa.device_code <> ''
ORDER BY rqa.device_code, rqa.created_at DESC;

-- 4. สร้าง indexes สำหรับ device data summary
CREATE UNIQUE INDEX IF NOT EXISTS idx_device_data_summary_device 
ON device_data_summary(device_code);

CREATE INDEX IF NOT EXISTS idx_device_data_summary_updated 
ON device_data_summary(last_updated DESC);

-- 5. สร้าง optimized functions using views
CREATE OR REPLACE FUNCTION public.get_super_fast_guest_devices()
RETURNS TABLE(device_code text, display_name text, updated_at timestamp without time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    dds.device_code,
    dds.display_name,
    dds.last_updated as updated_at
  FROM device_data_summary dds
  WHERE dds.device_code IN (
    SELECT das.device_code 
    FROM device_access_summary das 
    WHERE das.access_type = 'guest' AND das.enabled = true
  )
  ORDER BY dds.last_updated DESC NULLS LAST
  LIMIT 20;
$$;

CREATE OR REPLACE FUNCTION public.get_super_fast_auth_devices(
  user_id_param uuid DEFAULT NULL,
  is_admin_param boolean DEFAULT false,
  is_superadmin_param boolean DEFAULT false
)
RETURNS TABLE(device_code text, display_name text, updated_at timestamp without time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    dds.device_code,
    dds.display_name,
    dds.last_updated as updated_at
  FROM device_data_summary dds
  WHERE 
    CASE 
      WHEN is_superadmin_param THEN true
      WHEN is_admin_param THEN 
        dds.device_code IN (
          SELECT das.device_code FROM device_access_summary das 
          WHERE das.access_type IN ('admin', 'guest')
        )
      ELSE 
        user_id_param IS NOT NULL AND dds.device_code IN (
          SELECT das.device_code FROM device_access_summary das 
          WHERE das.access_type = 'user' AND das.enabled = true
        )
    END
  ORDER BY dds.last_updated DESC NULLS LAST
  LIMIT 50;
$$;

-- 6. สร้าง simple refresh function
CREATE OR REPLACE FUNCTION public.refresh_optimized_views()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  BEGIN
    REFRESH MATERIALIZED VIEW device_access_summary;
    REFRESH MATERIALIZED VIEW device_data_summary;
    RAISE NOTICE 'Optimized views refreshed successfully';
    RETURN true;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Failed to refresh optimized views: %', SQLERRM;
      RETURN false;
  END;
END;
$$;