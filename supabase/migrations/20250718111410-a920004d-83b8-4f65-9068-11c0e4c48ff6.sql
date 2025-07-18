-- Fix increment_counter function with ambiguous column reference
CREATE OR REPLACE FUNCTION public.increment_counter(counter_name text, increment_by bigint DEFAULT 1)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO public.performance_counters (counter_name, counter_value, updated_at)
    VALUES (increment_counter.counter_name, increment_by, now())
    ON CONFLICT (counter_name) 
    DO UPDATE SET 
        counter_value = performance_counters.counter_value + increment_by,
        updated_at = now();
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to increment counter %: % (SQLSTATE: %)', increment_counter.counter_name, SQLERRM, SQLSTATE;
END;
$function$;

-- Recreate guest_devices_cache table with proper constraints and indexes
DROP TABLE IF EXISTS public.guest_devices_cache CASCADE;

CREATE TABLE public.guest_devices_cache (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    device_code text NOT NULL UNIQUE,
    display_name text,
    updated_at timestamp without time zone,
    cached_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone DEFAULT (now() + INTERVAL '5 minutes')
);

-- Create index for performance
CREATE INDEX idx_guest_devices_cache_device_code ON public.guest_devices_cache(device_code);
CREATE INDEX idx_guest_devices_cache_expires_at ON public.guest_devices_cache(expires_at);

-- Enable RLS on guest_devices_cache
ALTER TABLE public.guest_devices_cache ENABLE ROW LEVEL SECURITY;

-- RLS policies for guest_devices_cache
CREATE POLICY "Allow public read access to guest devices cache"
ON public.guest_devices_cache
FOR SELECT
USING (true);

CREATE POLICY "Only system can manage guest devices cache"
ON public.guest_devices_cache
FOR ALL
USING (false)
WITH CHECK (false);

-- Simplified and optimized get_guest_devices_fast function
CREATE OR REPLACE FUNCTION public.get_guest_devices_fast()
RETURNS TABLE(device_code text, display_name text, updated_at timestamp without time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
SET statement_timeout TO '5s'
AS $function$
DECLARE
  start_time TIMESTAMPTZ;
  execution_time_ms NUMERIC;
  device_count INTEGER := 0;
BEGIN
  start_time := clock_timestamp();
  
  BEGIN
    -- Check if cache exists and is valid
    IF EXISTS (
      SELECT 1 FROM public.guest_devices_cache 
      WHERE expires_at > now() 
      LIMIT 1
    ) THEN
      -- Return cached data
      RETURN QUERY
      SELECT 
        gdc.device_code,
        gdc.display_name,
        gdc.updated_at
      FROM public.guest_devices_cache gdc
      WHERE gdc.expires_at > now()
      ORDER BY gdc.updated_at DESC NULLS LAST;
      
      GET DIAGNOSTICS device_count = ROW_COUNT;
      RAISE NOTICE 'Returned % cached guest devices', device_count;
      PERFORM public.increment_counter('cache_hits');
    ELSE
      -- Clear expired cache
      DELETE FROM public.guest_devices_cache WHERE expires_at <= now();
      
      -- Build fresh data and cache it
      WITH fresh_data AS (
        SELECT 
          gda.device_code,
          COALESCE(ds.display_name, gda.device_code) as display_name,
          COALESCE(latest_analysis.created_at, '2025-01-01 00:00:00'::timestamp without time zone) as updated_at
        FROM guest_device_access gda
        LEFT JOIN device_settings ds ON gda.device_code = ds.device_code
        LEFT JOIN LATERAL (
          SELECT rqa.created_at
          FROM rice_quality_analysis rqa 
          WHERE rqa.device_code::text = gda.device_code
          ORDER BY rqa.created_at DESC 
          LIMIT 1
        ) latest_analysis ON true
        WHERE gda.enabled = true
        ORDER BY latest_analysis.created_at DESC NULLS LAST
        LIMIT 20
      )
      INSERT INTO public.guest_devices_cache (device_code, display_name, updated_at)
      SELECT fd.device_code, fd.display_name, fd.updated_at
      FROM fresh_data fd
      ON CONFLICT (device_code) 
      DO UPDATE SET 
        display_name = EXCLUDED.display_name,
        updated_at = EXCLUDED.updated_at,
        cached_at = now(),
        expires_at = now() + INTERVAL '5 minutes'
      RETURNING device_code, display_name, updated_at;
      
      GET DIAGNOSTICS device_count = ROW_COUNT;
      RAISE NOTICE 'Refreshed and cached % guest devices', device_count;
      PERFORM public.increment_counter('cache_misses');
    END IF;

    execution_time_ms := EXTRACT(MILLISECONDS FROM clock_timestamp() - start_time);
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

-- Create trigger to invalidate cache when guest device access changes
CREATE OR REPLACE FUNCTION public.trigger_invalidate_guest_cache()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Invalidate cache when guest device access changes
  DELETE FROM public.guest_devices_cache;
  RAISE NOTICE 'Guest devices cache invalidated due to % on %', TG_OP, TG_TABLE_NAME;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$function$;

-- Create triggers to invalidate cache
DROP TRIGGER IF EXISTS trigger_invalidate_guest_cache_on_access ON guest_device_access;
CREATE TRIGGER trigger_invalidate_guest_cache_on_access
  AFTER INSERT OR UPDATE OR DELETE ON guest_device_access
  FOR EACH ROW EXECUTE FUNCTION trigger_invalidate_guest_cache();

DROP TRIGGER IF EXISTS trigger_invalidate_guest_cache_on_settings ON device_settings;
CREATE TRIGGER trigger_invalidate_guest_cache_on_settings
  AFTER INSERT OR UPDATE OR DELETE ON device_settings
  FOR EACH ROW EXECUTE FUNCTION trigger_invalidate_guest_cache();