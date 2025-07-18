-- Phase 4: Database Query Optimization - ลดการ query ซ้ำซ้อน

-- 1. สร้าง materialized view สำหรับ device access summary
CREATE MATERIALIZED VIEW IF NOT EXISTS device_access_summary AS
SELECT 
  device_code,
  'guest' as access_type,
  true as enabled,
  'Guest Access' as access_source,
  now() as created_at
FROM guest_device_access 
WHERE enabled = true
UNION ALL
SELECT 
  uda.device_code,
  'user' as access_type,
  true as enabled,
  CONCAT('User: ', p.email) as access_source,
  uda.created_at
FROM user_device_access uda
LEFT JOIN profiles p ON p.id = uda.user_id
UNION ALL
SELECT 
  DISTINCT rqa.device_code::text as device_code,
  'admin' as access_type,
  true as enabled,
  'Admin Access' as access_source,
  MIN(rqa.created_at) as created_at
FROM rice_quality_analysis rqa
WHERE rqa.device_code IS NOT NULL 
  AND rqa.device_code <> ''
GROUP BY rqa.device_code;

-- 2. สร้าง indexes สำหรับ materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_device_access_summary_unique 
ON device_access_summary(device_code, access_type);

CREATE INDEX IF NOT EXISTS idx_device_access_summary_type 
ON device_access_summary(access_type);

CREATE INDEX IF NOT EXISTS idx_device_access_summary_enabled 
ON device_access_summary(device_code) WHERE enabled = true;

-- 3. สร้าง optimized device data summary view
CREATE MATERIALIZED VIEW IF NOT EXISTS device_data_summary AS
SELECT DISTINCT ON (rqa.device_code)
  rqa.device_code::text,
  rqa.created_at as last_updated,
  COALESCE(ds.display_name, rqa.device_code::text) as display_name,
  COALESCE(ds.location, 'ไม่ระบุ') as location,
  COALESCE(ds.graph_color, '#9b87f5') as graph_color,
  -- Basic quality indicators (for performance)
  CASE 
    WHEN rqa.created_at > now() - INTERVAL '1 hour' THEN 'recent'
    WHEN rqa.created_at > now() - INTERVAL '1 day' THEN 'daily'
    ELSE 'old'
  END as data_freshness,
  -- Device activity status
  CASE 
    WHEN rqa.created_at > now() - INTERVAL '30 minutes' THEN 'active'
    WHEN rqa.created_at > now() - INTERVAL '2 hours' THEN 'idle'
    ELSE 'inactive'
  END as activity_status
FROM rice_quality_analysis rqa
LEFT JOIN device_settings ds ON ds.device_code = rqa.device_code::text
WHERE rqa.device_code IS NOT NULL 
  AND rqa.device_code <> ''
ORDER BY rqa.device_code, rqa.created_at DESC;

-- 4. สร้าง indexes สำหรับ device data summary
CREATE UNIQUE INDEX IF NOT EXISTS idx_device_data_summary_device 
ON device_data_summary(device_code);

CREATE INDEX IF NOT EXISTS idx_device_data_summary_freshness 
ON device_data_summary(data_freshness);

CREATE INDEX IF NOT EXISTS idx_device_data_summary_activity 
ON device_data_summary(activity_status);

CREATE INDEX IF NOT EXISTS idx_device_data_summary_updated 
ON device_data_summary(last_updated DESC);

-- 5. สร้าง optimized guest device function ใช้ materialized views
CREATE OR REPLACE FUNCTION public.get_optimized_guest_devices()
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
  INNER JOIN device_access_summary das ON das.device_code = dds.device_code
  WHERE das.access_type = 'guest' 
    AND das.enabled = true
  ORDER BY dds.last_updated DESC NULLS LAST
  LIMIT 20;
$$;

-- 6. สร้าง optimized authenticated devices function
CREATE OR REPLACE FUNCTION public.get_optimized_auth_devices(
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
      WHEN is_superadmin_param THEN true  -- Superadmin sees all
      WHEN is_admin_param THEN           -- Admin sees most (exclude hidden)
        NOT EXISTS (
          SELECT 1 FROM admin_device_visibility adv 
          WHERE adv.device_code = dds.device_code 
          AND adv.hidden_for_admin = true
        )
      ELSE                               -- Regular user sees only assigned devices
        user_id_param IS NOT NULL AND EXISTS (
          SELECT 1 FROM device_access_summary das 
          WHERE das.device_code = dds.device_code 
          AND das.access_type = 'user'
        )
    END
  ORDER BY dds.last_updated DESC NULLS LAST
  LIMIT 50;
$$;

-- 7. สร้าง function สำหรับ refresh materialized views
CREATE OR REPLACE FUNCTION public.refresh_device_views()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_time TIMESTAMPTZ;
  execution_time INTERVAL;
BEGIN
  start_time := clock_timestamp();
  
  BEGIN
    -- Refresh both views concurrently if possible
    REFRESH MATERIALIZED VIEW CONCURRENTLY device_access_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY device_data_summary;
    
    execution_time := clock_timestamp() - start_time;
    RAISE NOTICE 'Device views refreshed successfully in %ms', 
      EXTRACT(MILLISECONDS FROM execution_time);
    
    RETURN true;
  EXCEPTION
    WHEN OTHERS THEN
      execution_time := clock_timestamp() - start_time;
      RAISE WARNING 'Failed to refresh device views after %ms: % (SQLSTATE: %)', 
        EXTRACT(MILLISECONDS FROM execution_time), SQLERRM, SQLSTATE;
      RETURN false;
  END;
END;
$$;

-- 8. สร้าง performance monitoring table
CREATE TABLE IF NOT EXISTS query_performance_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name text NOT NULL,
  execution_time_ms numeric NOT NULL,
  result_count integer,
  cached boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- 9. เพิ่ม RLS สำหรับ performance log (admin only)
ALTER TABLE query_performance_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view query performance" ON query_performance_log
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- 10. สร้าง cron job สำหรับ refresh views ทุก 5 นาที
SELECT cron.schedule(
  'refresh-device-views',
  '*/5 * * * *', -- ทุก 5 นาที
  'SELECT public.refresh_device_views();'
);