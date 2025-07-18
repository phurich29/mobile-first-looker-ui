-- Step 3: Create Optimized Guest Functions with Caching

-- 3.1 Create cache table for guest devices
CREATE TABLE IF NOT EXISTS public.guest_devices_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_code TEXT NOT NULL,
    display_name TEXT,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    cached_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '5 minutes'),
    UNIQUE(device_code)
);

-- Enable RLS on cache table
ALTER TABLE public.guest_devices_cache ENABLE ROW LEVEL SECURITY;

-- Allow public read access to cache
CREATE POLICY "Allow public read access to guest devices cache"
ON public.guest_devices_cache
FOR SELECT
USING (true);

-- Only system can write to cache
CREATE POLICY "Only system can manage guest devices cache"
ON public.guest_devices_cache
FOR ALL
USING (false)
WITH CHECK (false);

-- 3.2 Create optimized function with single query and caching
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
      RAISE NOTICE 'get_guest_devices_with_cache returned % cached devices in %ms', 
        device_count, EXTRACT(MILLISECONDS FROM execution_time);
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
      RAISE NOTICE 'get_guest_devices_with_cache refreshed and cached % devices in %ms', 
        device_count, EXTRACT(MILLISECONDS FROM execution_time);
    END IF;
      
  EXCEPTION
    WHEN query_canceled THEN
      RAISE WARNING 'get_guest_devices_with_cache was cancelled/timed out';
      RETURN;
    WHEN OTHERS THEN
      execution_time := clock_timestamp() - start_time;
      RAISE WARNING 'get_guest_devices_with_cache failed after %ms: % (SQLSTATE: %)', 
        EXTRACT(MILLISECONDS FROM execution_time), SQLERRM, SQLSTATE;
      RETURN;
  END;
END;
$function$;

-- 3.3 Create function to invalidate cache when needed
CREATE OR REPLACE FUNCTION public.invalidate_guest_devices_cache()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  DELETE FROM public.guest_devices_cache;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RAISE NOTICE 'Invalidated guest devices cache: % records deleted', deleted_count;
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to invalidate guest devices cache: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
    RETURN false;
END;
$function$;

-- 3.4 Create function to check cache status
CREATE OR REPLACE FUNCTION public.get_guest_cache_status()
RETURNS TABLE(
  total_cached INTEGER,
  valid_cached INTEGER,
  expired_cached INTEGER,
  oldest_cache TIMESTAMP WITH TIME ZONE,
  newest_cache TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_cached,
    COUNT(CASE WHEN expires_at > now() THEN 1 END)::INTEGER as valid_cached,
    COUNT(CASE WHEN expires_at <= now() THEN 1 END)::INTEGER as expired_cached,
    MIN(cached_at) as oldest_cache,
    MAX(cached_at) as newest_cache
  FROM public.guest_devices_cache;
END;
$function$;

-- 3.5 Create trigger function to auto-invalidate cache when guest_device_access changes
CREATE OR REPLACE FUNCTION public.trigger_invalidate_guest_cache()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Invalidate cache when guest device access changes
  PERFORM public.invalidate_guest_devices_cache();
  
  RAISE NOTICE 'Guest devices cache invalidated due to % on guest_device_access', TG_OP;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$function$;

-- 3.6 Create trigger on guest_device_access table
DROP TRIGGER IF EXISTS invalidate_guest_cache_trigger ON public.guest_device_access;
CREATE TRIGGER invalidate_guest_cache_trigger
  AFTER INSERT OR UPDATE OR DELETE
  ON public.guest_device_access
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_invalidate_guest_cache();

-- 3.7 Create trigger on device_settings table for guest devices
CREATE OR REPLACE FUNCTION public.trigger_invalidate_guest_cache_on_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only invalidate if this device is a guest device
  IF EXISTS (
    SELECT 1 FROM public.guest_device_access gda
    WHERE gda.device_code = COALESCE(NEW.device_code, OLD.device_code)
    AND gda.enabled = true
  ) THEN
    PERFORM public.invalidate_guest_devices_cache();
    RAISE NOTICE 'Guest devices cache invalidated due to device_settings change for device %', 
      COALESCE(NEW.device_code, OLD.device_code);
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$function$;

DROP TRIGGER IF EXISTS invalidate_guest_cache_on_settings_trigger ON public.device_settings;
CREATE TRIGGER invalidate_guest_cache_on_settings_trigger
  AFTER INSERT OR UPDATE OR DELETE
  ON public.device_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_invalidate_guest_cache_on_settings();