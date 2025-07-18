-- Phase 1A: หยุด Auto-Triggers อย่างปลอดภัย (ไม่จับ cron jobs ที่ไม่มี)

-- 1. ปิด notification trigger ที่รันทุกครั้งมีข้อมูลใหม่
DROP TRIGGER IF EXISTS trigger_check_notifications ON rice_quality_analysis;

-- 2. ปิด guest cache invalidation triggers ที่อาจสร้าง cascade
DROP TRIGGER IF EXISTS guest_cache_invalidation_trigger ON guest_device_access;
DROP TRIGGER IF EXISTS trigger_invalidate_guest_cache ON guest_device_access;
DROP TRIGGER IF EXISTS trigger_invalidate_guest_cache_on_settings ON device_settings;

-- 3. แทนที่จะลบ cron jobs ที่อาจไม่มี ให้สร้าง safe function แทน
CREATE OR REPLACE FUNCTION public.safe_check_notification_thresholds()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    last_run_time TIMESTAMP;
    min_interval INTERVAL := '10 minutes'; -- เพิ่ม interval เป็น 10 นาที
BEGIN
    -- Circuit breaker: ตรวจสอบว่าเพิ่งรันไปหรือไม่ 
    SELECT MAX(timestamp) INTO last_run_time 
    FROM notifications 
    WHERE timestamp > now() - min_interval;
    
    -- ถ้าเพิ่งรันไป ให้ skip (ป้องกัน rapid fire)
    IF last_run_time IS NOT NULL AND (now() - last_run_time) < min_interval THEN
        RAISE NOTICE 'Skipping notification check - too recent (last run: %)', last_run_time;
        RETURN;
    END IF;
    
    -- รัน notification check ปกติ แต่มี exception handling
    BEGIN
        PERFORM public.check_notification_thresholds();
        RAISE NOTICE 'Notification check completed successfully at %', now();
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING 'Notification check failed: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
            -- ไม่ให้ throw error ต่อ เพื่อป้องกัน cascade failures
            RETURN;
    END;
END;
$$;

-- 4. สร้าง rate limiting function สำหรับ guest devices
CREATE OR REPLACE FUNCTION public.rate_limited_guest_devices()
RETURNS TABLE(device_code text, display_name text, updated_at timestamp without time zone)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    last_call_time TIMESTAMP;
    call_interval INTERVAL := '30 seconds'; -- ป้องกันการเรียกบ่อยเกินไป
BEGIN
    -- ตรวจสอบ rate limit
    SELECT cached_at INTO last_call_time 
    FROM guest_devices_cache 
    ORDER BY cached_at DESC 
    LIMIT 1;
    
    -- ถ้าเพิ่งเรียกไป ให้ใช้ cache
    IF last_call_time IS NOT NULL AND (now() - last_call_time) < call_interval THEN
        RETURN QUERY
        SELECT gdc.device_code, gdc.display_name, gdc.updated_at
        FROM guest_devices_cache gdc
        WHERE gdc.expires_at > now()
        ORDER BY gdc.updated_at DESC NULLS LAST;
        RETURN;
    END IF;
    
    -- เรียก function จริง
    RETURN QUERY
    SELECT * FROM public.get_guest_devices_fast();
END;
$$;