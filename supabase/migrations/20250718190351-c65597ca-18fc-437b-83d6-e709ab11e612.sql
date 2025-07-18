-- ลบ function เก่าก่อน
DROP FUNCTION IF EXISTS public.increment_counter(text, bigint);

-- สร้าง function ใหม่ที่แก้ปัญหา "counter_name is ambiguous"
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