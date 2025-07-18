-- Step 4: Database Performance Tuning

-- 4.1 Create slow query log table
CREATE TABLE IF NOT EXISTS public.slow_query_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_name TEXT NOT NULL,
    query_text TEXT,
    execution_time_ms NUMERIC NOT NULL,
    user_id UUID,
    parameters JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    error_message TEXT,
    sql_state TEXT
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_slow_query_log_created_at ON public.slow_query_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_slow_query_log_execution_time ON public.slow_query_log(execution_time_ms DESC);
CREATE INDEX IF NOT EXISTS idx_slow_query_log_query_name ON public.slow_query_log(query_name);

-- Enable RLS
ALTER TABLE public.slow_query_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view performance logs
CREATE POLICY "Only admins can view slow query logs"
ON public.slow_query_log
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- System can insert logs
CREATE POLICY "System can insert slow query logs"
ON public.slow_query_log
FOR INSERT
WITH CHECK (true);

-- 4.2 Create performance counters table
CREATE TABLE IF NOT EXISTS public.performance_counters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    counter_name TEXT NOT NULL UNIQUE,
    counter_value BIGINT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert initial counters
INSERT INTO public.performance_counters (counter_name, counter_value)
VALUES 
    ('total_queries', 0),
    ('slow_queries', 0),
    ('guest_device_queries', 0),
    ('cache_hits', 0),
    ('cache_misses', 0),
    ('errors', 0)
ON CONFLICT (counter_name) DO NOTHING;

-- Enable RLS
ALTER TABLE public.performance_counters ENABLE ROW LEVEL SECURITY;

-- Admins can view counters
CREATE POLICY "Admins can view performance counters"
ON public.performance_counters
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- System can update counters
CREATE POLICY "System can update performance counters"
ON public.performance_counters
FOR ALL
USING (true)
WITH CHECK (true);

-- 4.3 Create function to log slow queries
CREATE OR REPLACE FUNCTION public.log_slow_query(
    p_query_name TEXT,
    p_execution_time_ms NUMERIC,
    p_query_text TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
    p_parameters JSONB DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL,
    p_sql_state TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Only log if execution time is over threshold (100ms)
    IF p_execution_time_ms > 100 THEN
        INSERT INTO public.slow_query_log (
            query_name, 
            execution_time_ms, 
            query_text, 
            user_id, 
            parameters, 
            error_message, 
            sql_state
        )
        VALUES (
            p_query_name, 
            p_execution_time_ms, 
            p_query_text, 
            p_user_id, 
            p_parameters, 
            p_error_message, 
            p_sql_state
        );
        
        -- Increment slow query counter
        PERFORM public.increment_counter('slow_queries');
    END IF;
    
    -- Always increment total queries counter
    PERFORM public.increment_counter('total_queries');
EXCEPTION
    WHEN OTHERS THEN
        -- Don't let logging errors block the main operation
        RAISE WARNING 'Failed to log slow query: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END;
$function$;

-- 4.4 Create function to increment performance counters
CREATE OR REPLACE FUNCTION public.increment_counter(counter_name TEXT, increment_by BIGINT DEFAULT 1)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO public.performance_counters (counter_name, counter_value, updated_at)
    VALUES (counter_name, increment_by, now())
    ON CONFLICT (counter_name) 
    DO UPDATE SET 
        counter_value = public.performance_counters.counter_value + increment_by,
        updated_at = now();
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to increment counter %: % (SQLSTATE: %)', counter_name, SQLERRM, SQLSTATE;
END;
$function$;

-- 4.5 Create function to get performance metrics
CREATE OR REPLACE FUNCTION public.get_performance_metrics()
RETURNS TABLE(
    metric_name TEXT,
    metric_value BIGINT,
    last_updated TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        pc.counter_name as metric_name,
        pc.counter_value as metric_value,
        pc.updated_at as last_updated
    FROM public.performance_counters pc
    ORDER BY pc.counter_name;
END;
$function$;

-- 4.6 Create function to analyze slow queries
CREATE OR REPLACE FUNCTION public.analyze_slow_queries(
    hours_back INTEGER DEFAULT 24
)
RETURNS TABLE(
    query_name TEXT,
    total_calls BIGINT,
    avg_execution_ms NUMERIC,
    max_execution_ms NUMERIC,
    min_execution_ms NUMERIC,
    total_time_ms NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        sql.query_name,
        COUNT(*)::BIGINT as total_calls,
        ROUND(AVG(sql.execution_time_ms), 2) as avg_execution_ms,
        MAX(sql.execution_time_ms) as max_execution_ms,
        MIN(sql.execution_time_ms) as min_execution_ms,
        ROUND(SUM(sql.execution_time_ms), 2) as total_time_ms
    FROM public.slow_query_log sql
    WHERE sql.created_at > (now() - (hours_back || ' hours')::INTERVAL)
    GROUP BY sql.query_name
    ORDER BY total_time_ms DESC;
END;
$function$;

-- 4.7 Create function to cleanup old logs
CREATE OR REPLACE FUNCTION public.cleanup_old_performance_logs(days_to_keep INTEGER DEFAULT 7)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    DELETE FROM public.slow_query_log 
    WHERE created_at < (now() - (days_to_keep || ' days')::INTERVAL);
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RAISE NOTICE 'Cleaned up % old performance log records older than % days', deleted_count, days_to_keep;
    
    RETURN deleted_count;
END;
$function$;

-- 4.8 Update existing functions to include performance logging
CREATE OR REPLACE FUNCTION public.get_guest_devices_with_cache()
RETURNS TABLE(device_code text, display_name text, updated_at timestamp without time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
SET statement_timeout = '10s'
AS $function$
DECLARE
  start_time TIMESTAMPTZ;
  execution_time INTERVAL;
  execution_time_ms NUMERIC;
  cache_valid BOOLEAN := false;
  device_count INTEGER := 0;
BEGIN
  start_time := clock_timestamp();
  
  RAISE NOTICE 'get_guest_devices_with_cache started';

  BEGIN
    -- Check if cache is valid and not expired
    SELECT COUNT(*) > 0 INTO cache_valid
    FROM public.guest_devices_cache
    WHERE expires_at > now()
    LIMIT 1;

    IF cache_valid THEN
      -- Return cached results
      RAISE NOTICE 'Returning cached guest devices data';
      
      RETURN QUERY
      SELECT 
        gdc.device_code,
        gdc.display_name,
        gdc.updated_at
      FROM public.guest_devices_cache gdc
      WHERE gdc.expires_at > now()
      ORDER BY gdc.updated_at DESC NULLS LAST;
      
      GET DIAGNOSTICS device_count = ROW_COUNT;
      
      execution_time := clock_timestamp() - start_time;
      execution_time_ms := EXTRACT(MILLISECONDS FROM execution_time);
      
      RAISE NOTICE 'get_guest_devices_with_cache returned % cached devices in %ms', device_count, execution_time_ms;
      
      -- Log cache hit
      PERFORM public.increment_counter('cache_hits');
      PERFORM public.increment_counter('guest_device_queries');
    ELSE
      -- Cache is invalid, refresh data
      RAISE NOTICE 'Cache expired or invalid, refreshing guest devices data';
      
      -- Clear expired cache
      DELETE FROM public.guest_devices_cache 
      WHERE expires_at <= now();
      
      -- Get fresh data with optimized single query
      WITH fresh_guest_data AS (
        SELECT 
          geda.device_code,
          COALESCE(ds.display_name, geda.device_code) as display_name,
          latest_data.latest_created_at as updated_at
        FROM guest_device_access geda
        LEFT JOIN device_settings ds ON geda.device_code = ds.device_code
        LEFT JOIN LATERAL (
          SELECT rqa.created_at as latest_created_at
          FROM rice_quality_analysis rqa
          WHERE rqa.device_code::text = geda.device_code
            AND rqa.device_code IS NOT NULL 
            AND rqa.device_code <> ''
          ORDER BY rqa.created_at DESC
          LIMIT 1
        ) latest_data ON true
        WHERE geda.enabled = true
      )
      -- Insert into cache and return
      INSERT INTO public.guest_devices_cache (device_code, display_name, updated_at)
      SELECT 
        fgd.device_code,
        fgd.display_name,
        fgd.updated_at
      FROM fresh_guest_data fgd
      ON CONFLICT (device_code) 
      DO UPDATE SET 
        display_name = EXCLUDED.display_name,
        updated_at = EXCLUDED.updated_at,
        cached_at = now(),
        expires_at = now() + INTERVAL '5 minutes'
      RETURNING device_code, display_name, updated_at;
      
      GET DIAGNOSTICS device_count = ROW_COUNT;
      
      execution_time := clock_timestamp() - start_time;
      execution_time_ms := EXTRACT(MILLISECONDS FROM execution_time);
      
      RAISE NOTICE 'get_guest_devices_with_cache refreshed and cached % devices in %ms', device_count, execution_time_ms;
      
      -- Log cache miss
      PERFORM public.increment_counter('cache_misses');
      PERFORM public.increment_counter('guest_device_queries');
    END IF;

    -- Log performance if slow
    PERFORM public.log_slow_query(
      'get_guest_devices_with_cache', 
      execution_time_ms,
      'Guest devices query with caching',
      NULL,
      jsonb_build_object('device_count', device_count, 'cache_hit', cache_valid)
    );
      
  EXCEPTION
    WHEN query_canceled THEN
      execution_time := clock_timestamp() - start_time;
      execution_time_ms := EXTRACT(MILLISECONDS FROM execution_time);
      
      PERFORM public.increment_counter('errors');
      PERFORM public.log_slow_query(
        'get_guest_devices_with_cache', 
        execution_time_ms,
        'Guest devices query with caching - TIMEOUT',
        NULL,
        NULL,
        'Query was cancelled/timed out',
        '57014'
      );
      
      RAISE WARNING 'get_guest_devices_with_cache was cancelled/timed out';
      RETURN;
    WHEN OTHERS THEN
      execution_time := clock_timestamp() - start_time;
      execution_time_ms := EXTRACT(MILLISECONDS FROM execution_time);
      
      PERFORM public.increment_counter('errors');
      PERFORM public.log_slow_query(
        'get_guest_devices_with_cache', 
        execution_time_ms,
        'Guest devices query with caching - ERROR',
        NULL,
        NULL,
        SQLERRM,
        SQLSTATE
      );
      
      RAISE WARNING 'get_guest_devices_with_cache failed after %ms: % (SQLSTATE: %)', 
        execution_time_ms, SQLERRM, SQLSTATE;
      RETURN;
  END;
END;
$function$;