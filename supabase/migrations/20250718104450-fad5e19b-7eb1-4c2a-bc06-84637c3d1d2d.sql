-- Step 5: Database Connection Pool Optimization & Emergency Fixes (Fixed)

-- 5.1 Create lightweight emergency fallback function
CREATE OR REPLACE FUNCTION public.get_devices_emergency_fallback()
RETURNS TABLE(device_code text, display_name text, updated_at timestamp without time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
SET statement_timeout = '5s'
AS $function$
DECLARE
  start_time TIMESTAMPTZ;
  execution_time_ms NUMERIC;
BEGIN
  start_time := clock_timestamp();
  
  -- Ultra-fast query - only essential data
  RETURN QUERY
  SELECT 
    gda.device_code,
    gda.device_code as display_name, -- Use device_code as display_name for speed
    '2025-01-01 00:00:00'::timestamp without time zone as updated_at -- Static timestamp for speed
  FROM guest_device_access gda
  WHERE gda.enabled = true
  LIMIT 10; -- Limit results for speed
  
  execution_time_ms := EXTRACT(MILLISECONDS FROM clock_timestamp() - start_time);
  
  PERFORM public.log_slow_query(
    'get_devices_emergency_fallback',
    execution_time_ms,
    'Emergency fallback query'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Emergency fallback failed: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
    RETURN;
END;
$function$;

-- 5.2 Optimize get_devices_with_details with faster timeout
CREATE OR REPLACE FUNCTION public.get_devices_with_details(user_id_param text DEFAULT NULL::text, is_admin_param boolean DEFAULT false, is_superadmin_param boolean DEFAULT false)
 RETURNS TABLE(device_code text, display_name text, updated_at timestamp without time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
 SET statement_timeout = '8s'  -- Reduced from 30s to 8s
AS $function$
DECLARE
  excluded_devices TEXT[] := ARRAY[
    '6000306302140',
    '6000306302141', 
    '6000306302143',
    '6000306302144'
  ];
  start_time TIMESTAMPTZ;
  execution_time_ms NUMERIC;
BEGIN
  start_time := clock_timestamp();
  
  RAISE NOTICE 'get_devices_with_details started (optimized) for user: %, admin: %, superadmin: %', 
    user_id_param, is_admin_param, is_superadmin_param;

  BEGIN
    -- Simplified queries with better indexes usage
    IF is_superadmin_param THEN
      RETURN QUERY
      SELECT DISTINCT ON (rqa.device_code)
        rqa.device_code::text,
        COALESCE(ds.display_name, rqa.device_code::text) as display_name,
        rqa.created_at as updated_at
      FROM rice_quality_analysis rqa
      LEFT JOIN device_settings ds ON rqa.device_code::text = ds.device_code
      WHERE rqa.device_code IS NOT NULL 
        AND rqa.device_code <> ''
        AND rqa.device_code::text <> ALL(excluded_devices)
      ORDER BY rqa.device_code, rqa.created_at DESC
      LIMIT 50; -- Add limit for performance
      
    ELSIF is_admin_param THEN
      RETURN QUERY
      SELECT DISTINCT ON (rqa.device_code)
        rqa.device_code::text,
        COALESCE(ds.display_name, rqa.device_code::text) as display_name,
        rqa.created_at as updated_at
      FROM rice_quality_analysis rqa
      LEFT JOIN device_settings ds ON rqa.device_code::text = ds.device_code
      WHERE rqa.device_code IS NOT NULL 
        AND rqa.device_code <> ''
        AND rqa.device_code::text <> ALL(excluded_devices)
        AND NOT EXISTS (
          SELECT 1 FROM admin_device_visibility adv
          WHERE adv.device_code = rqa.device_code::text 
          AND adv.hidden_for_admin = true
        )
      ORDER BY rqa.device_code, rqa.created_at DESC
      LIMIT 50; -- Add limit for performance
      
    ELSE
      RETURN QUERY
      SELECT DISTINCT ON (rqa.device_code)
        rqa.device_code::text,
        COALESCE(ds.display_name, rqa.device_code::text) as display_name,
        rqa.created_at as updated_at
      FROM rice_quality_analysis rqa
      INNER JOIN user_device_access uda ON rqa.device_code::text = uda.device_code
      LEFT JOIN device_settings ds ON rqa.device_code::text = ds.device_code
      WHERE user_id_param IS NOT NULL 
        AND uda.user_id::text = user_id_param
        AND rqa.device_code IS NOT NULL 
        AND rqa.device_code <> ''
        AND rqa.device_code::text <> ALL(excluded_devices)
      ORDER BY rqa.device_code, rqa.created_at DESC
      LIMIT 20; -- Smaller limit for regular users
    END IF;

    execution_time_ms := EXTRACT(MILLISECONDS FROM clock_timestamp() - start_time);
    RAISE NOTICE 'get_devices_with_details completed successfully in %ms', execution_time_ms;
    
    PERFORM public.log_slow_query('get_devices_with_details_optimized', execution_time_ms);
      
  EXCEPTION
    WHEN query_canceled THEN
      execution_time_ms := EXTRACT(MILLISECONDS FROM clock_timestamp() - start_time);
      PERFORM public.increment_counter('errors');
      RAISE WARNING 'get_devices_with_details was cancelled/timed out after %ms', execution_time_ms;
      RETURN;
    WHEN OTHERS THEN
      execution_time_ms := EXTRACT(MILLISECONDS FROM clock_timestamp() - start_time);
      PERFORM public.increment_counter('errors');
      RAISE WARNING 'get_devices_with_details failed after %ms: % (SQLSTATE: %)', 
        execution_time_ms, SQLERRM, SQLSTATE;
      RETURN;
  END;
END;
$function$;

-- 5.3 Create optimized guest devices function with faster timeout
CREATE OR REPLACE FUNCTION public.get_guest_devices_fast()
RETURNS TABLE(device_code text, display_name text, updated_at timestamp without time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
SET statement_timeout = '5s'  -- Very fast timeout
AS $function$
DECLARE
  start_time TIMESTAMPTZ;
  execution_time_ms NUMERIC;
BEGIN
  start_time := clock_timestamp();
  
  BEGIN
    -- Super fast query - use indexes efficiently
    RETURN QUERY
    SELECT 
      gda.device_code,
      COALESCE(ds.display_name, gda.device_code) as display_name,
      COALESCE(latest.created_at, '2025-01-01 00:00:00'::timestamp without time zone) as updated_at
    FROM guest_device_access gda
    LEFT JOIN device_settings ds ON gda.device_code = ds.device_code
    LEFT JOIN LATERAL (
      SELECT created_at
      FROM rice_quality_analysis rqa 
      WHERE rqa.device_code::text = gda.device_code
      ORDER BY created_at DESC 
      LIMIT 1
    ) latest ON true
    WHERE gda.enabled = true
    ORDER BY latest.created_at DESC NULLS LAST
    LIMIT 10; -- Small limit for speed

    execution_time_ms := EXTRACT(MILLISECONDS FROM clock_timestamp() - start_time);
    RAISE NOTICE 'get_guest_devices_fast completed in %ms', execution_time_ms;
    
    PERFORM public.increment_counter('guest_device_queries');
    PERFORM public.log_slow_query('get_guest_devices_fast', execution_time_ms);
      
  EXCEPTION
    WHEN query_canceled THEN
      execution_time_ms := EXTRACT(MILLISECONDS FROM clock_timestamp() - start_time);
      RAISE WARNING 'get_guest_devices_fast timed out after %ms', execution_time_ms;
      RETURN;
    WHEN OTHERS THEN
      execution_time_ms := EXTRACT(MILLISECONDS FROM clock_timestamp() - start_time);
      RAISE WARNING 'get_guest_devices_fast failed after %ms: % (SQLSTATE: %)', 
        execution_time_ms, SQLERRM, SQLSTATE;
      RETURN;
  END;
END;
$function$;

-- 5.4 Create function to check database health
CREATE OR REPLACE FUNCTION public.check_database_health()
RETURNS TABLE(
  check_name TEXT,
  status TEXT,
  execution_time_ms NUMERIC,
  details TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  start_time TIMESTAMPTZ;
  end_time TIMESTAMPTZ;
  exec_time NUMERIC;
  test_count INTEGER;
BEGIN
  -- Test 1: Simple query
  start_time := clock_timestamp();
  SELECT COUNT(*)::INTEGER INTO test_count FROM guest_device_access LIMIT 1;
  end_time := clock_timestamp();
  exec_time := EXTRACT(MILLISECONDS FROM end_time - start_time);
  
  RETURN QUERY SELECT 
    'simple_query'::TEXT, 
    CASE WHEN exec_time < 100 THEN 'GOOD' WHEN exec_time < 500 THEN 'WARNING' ELSE 'CRITICAL' END::TEXT,
    exec_time,
    ('Query returned ' || test_count || ' records')::TEXT;

  -- Test 2: Cache check
  start_time := clock_timestamp();
  SELECT COUNT(*)::INTEGER INTO test_count FROM guest_devices_cache;
  end_time := clock_timestamp();
  exec_time := EXTRACT(MILLISECONDS FROM end_time - start_time);
  
  RETURN QUERY SELECT 
    'cache_check'::TEXT,
    CASE WHEN exec_time < 50 THEN 'GOOD' WHEN exec_time < 200 THEN 'WARNING' ELSE 'CRITICAL' END::TEXT,
    exec_time,
    ('Cache has ' || test_count || ' records')::TEXT;

  -- Test 3: Performance counters
  start_time := clock_timestamp();
  SELECT COUNT(*)::INTEGER INTO test_count FROM performance_counters;
  end_time := clock_timestamp();
  exec_time := EXTRACT(MILLISECONDS FROM end_time - start_time);
  
  RETURN QUERY SELECT 
    'counters_check'::TEXT,
    CASE WHEN exec_time < 50 THEN 'GOOD' WHEN exec_time < 200 THEN 'WARNING' ELSE 'CRITICAL' END::TEXT,
    exec_time,
    ('Found ' || test_count || ' performance counters')::TEXT;
    
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT 
      'health_check_error'::TEXT,
      'CRITICAL'::TEXT,
      0::NUMERIC,
      SQLERRM::TEXT;
END;
$function$;

-- 5.5 Create indexes for better performance (fixed - without CONCURRENTLY)
CREATE INDEX IF NOT EXISTS idx_rice_quality_analysis_device_created 
ON rice_quality_analysis(device_code, created_at DESC) 
WHERE device_code IS NOT NULL AND device_code <> '';

CREATE INDEX IF NOT EXISTS idx_guest_device_access_enabled 
ON guest_device_access(enabled, device_code) 
WHERE enabled = true;