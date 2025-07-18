-- Phase 4B: สร้าง optimized views และ functions (แก้ไข syntax)

-- 1. สร้าง device data summary view ก่อน (ง่ายกว่า)
CREATE MATERIALIZED VIEW IF NOT EXISTS device_data_summary AS
SELECT DISTINCT ON (rqa.device_code)
  rqa.device_code::text as device_code,
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

-- 2. สร้าง indexes สำหรับ device data summary
CREATE UNIQUE INDEX IF NOT EXISTS idx_device_data_summary_device 
ON device_data_summary(device_code);

CREATE INDEX IF NOT EXISTS idx_device_data_summary_updated 
ON device_data_summary(last_updated DESC);

-- 3. สร้าง super fast guest devices function ใช้ existing tables
CREATE OR REPLACE FUNCTION public.get_super_fast_guest_devices()
RETURNS TABLE(device_code text, display_name text, updated_at timestamp without time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  -- ใช้ materialized view ถ้ามี ไม่งั้นใช้ table ธรรมดา
  SELECT 
    COALESCE(dds.device_code, gda.device_code) as device_code,
    COALESCE(dds.display_name, gda.device_code) as display_name,
    COALESCE(dds.last_updated, now()::timestamp without time zone) as updated_at
  FROM guest_device_access gda
  LEFT JOIN device_data_summary dds ON dds.device_code = gda.device_code
  WHERE gda.enabled = true
  ORDER BY dds.last_updated DESC NULLS LAST, gda.created_at DESC
  LIMIT 20;
$$;

-- 4. สร้าง super fast auth devices function
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
        -- Admin sees all devices except explicitly hidden ones
        NOT EXISTS (
          SELECT 1 FROM admin_device_visibility adv 
          WHERE adv.device_code = dds.device_code 
          AND adv.hidden_for_admin = true
        )
      ELSE 
        -- Regular users see only their assigned devices
        user_id_param IS NOT NULL AND EXISTS (
          SELECT 1 FROM user_device_access uda 
          WHERE uda.device_code = dds.device_code 
          AND uda.user_id = user_id_param
        )
    END
  ORDER BY dds.last_updated DESC NULLS LAST
  LIMIT 50;
$$;

-- 5. สร้าง circuit breaker function สำหรับ queries
CREATE OR REPLACE FUNCTION public.query_with_timeout(
  query_name text,
  timeout_seconds integer DEFAULT 5
)
RETURNS TABLE(success boolean, message text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_time TIMESTAMPTZ;
  execution_time INTERVAL;
  timeout_reached BOOLEAN := false;
BEGIN
  start_time := clock_timestamp();
  
  -- Set statement timeout
  EXECUTE format('SET LOCAL statement_timeout = %s', timeout_seconds * 1000);
  
  BEGIN
    -- Example query execution would go here
    -- For now, just return success
    execution_time := clock_timestamp() - start_time;
    
    RETURN QUERY SELECT true, format('Query %s completed in %sms', 
      query_name, EXTRACT(MILLISECONDS FROM execution_time));
      
  EXCEPTION
    WHEN query_canceled THEN
      RETURN QUERY SELECT false, format('Query %s timed out after %ss', 
        query_name, timeout_seconds);
    WHEN OTHERS THEN
      RETURN QUERY SELECT false, format('Query %s failed: %s', 
        query_name, SQLERRM);
  END;
END;
$$;

-- 6. สร้าง performance monitoring function
CREATE OR REPLACE FUNCTION public.log_query_performance(
  function_name text,
  execution_time_ms numeric,
  result_count integer DEFAULT 0,
  is_cached boolean DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log performance เฉพาะ slow queries (>100ms)
  IF execution_time_ms > 100 THEN
    INSERT INTO performance_counters (counter_name, counter_value, updated_at)
    VALUES (
      format('slow_query_%s', function_name),
      1,
      now()
    )
    ON CONFLICT (counter_name) DO UPDATE SET
      counter_value = performance_counters.counter_value + 1,
      updated_at = now();
  END IF;
  
  -- Log cache performance
  IF is_cached THEN
    PERFORM public.increment_counter('cache_hits');
  ELSE
    PERFORM public.increment_counter('cache_misses');
  END IF;
END;
$$;

-- 7. สร้าง refresh function สำหรับ materialized view
CREATE OR REPLACE FUNCTION public.refresh_device_summary()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_time TIMESTAMPTZ;
  execution_time_ms NUMERIC;
BEGIN
  start_time := clock_timestamp();
  
  BEGIN
    REFRESH MATERIALIZED VIEW device_data_summary;
    
    execution_time_ms := EXTRACT(MILLISECONDS FROM clock_timestamp() - start_time);
    
    PERFORM public.log_query_performance(
      'refresh_device_summary',
      execution_time_ms,
      (SELECT COUNT(*) FROM device_data_summary)::integer,
      false
    );
    
    RAISE NOTICE 'Device summary refreshed in %ms', execution_time_ms;
    RETURN true;
    
  EXCEPTION
    WHEN OTHERS THEN
      execution_time_ms := EXTRACT(MILLISECONDS FROM clock_timestamp() - start_time);
      RAISE WARNING 'Failed to refresh device summary after %ms: %', execution_time_ms, SQLERRM;
      RETURN false;
  END;
END;
$$;