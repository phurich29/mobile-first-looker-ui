-- แก้ไขปัญหา "column reference counter_name is ambiguous" ใน increment_counter function
CREATE OR REPLACE FUNCTION public.increment_counter(counter_name_param text, increment_by bigint DEFAULT 1)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    INSERT INTO public.performance_counters (counter_name, counter_value, updated_at)
    VALUES (counter_name_param, increment_by, now())
    ON CONFLICT (counter_name) 
    DO UPDATE SET 
        counter_value = performance_counters.counter_value + increment_by,
        updated_at = now();
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to increment counter %: % (SQLSTATE: %)', counter_name_param, SQLERRM, SQLSTATE;
END;
$$;

-- เพิ่ม index เพื่อเพิ่มประสิทธิภาพ query ที่ช้า
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rice_quality_analysis_device_created 
ON rice_quality_analysis (device_code, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_device_access_user_id 
ON user_device_access (user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_guest_device_access_enabled 
ON guest_device_access (enabled) WHERE enabled = true;