-- Phase 1: หยุด Auto-Triggers ที่สร้าง Infinity Loops

-- 1. ปิด notification trigger ที่รันทุกครั้งมีข้อมูลใหม่
DROP TRIGGER IF EXISTS trigger_check_notifications ON rice_quality_analysis;

-- 2. ปิด guest cache invalidation triggers ที่อาจสร้าง cascade
DROP TRIGGER IF EXISTS guest_cache_invalidation_trigger ON guest_device_access;
DROP TRIGGER IF EXISTS trigger_invalidate_guest_cache ON guest_device_access;
DROP TRIGGER IF EXISTS trigger_invalidate_guest_cache_on_settings ON device_settings;

-- 3. ปิด cron job ที่รันทุก 1 นาที (สร้าง DB load สูง)
SELECT cron.unschedule('check-notifications-every-minute');
SELECT cron.unschedule('notification-check');
SELECT cron.unschedule('check_notification_thresholds');

-- 4. เปลี่ยน cron job ให้รันทุก 10 นาทีแทน (ลด load)
SELECT cron.schedule(
    'check-notifications-reduced',
    '*/10 * * * *', -- ทุก 10 นาที
    $$
    BEGIN
        -- ใช้ exception handling เพื่อป้องกัน cascading errors
        PERFORM public.check_notification_thresholds();
    EXCEPTION WHEN OTHERS THEN
        -- Log error แต่ไม่ให้ block cron job
        RAISE WARNING 'Notification check failed: %', SQLERRM;
    END;
    $$
);

-- 5. เพิ่ม circuit breaker สำหรับ functions ที่อาจสร้าง loops
CREATE OR REPLACE FUNCTION public.safe_check_notification_thresholds()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    last_run_time TIMESTAMP;
    min_interval INTERVAL := '5 minutes';
BEGIN
    -- ตรวจสอบว่าเพิ่งรันไปหรือไม่ (circuit breaker)
    SELECT MAX(created_at) INTO last_run_time 
    FROM notifications 
    WHERE created_at > now() - min_interval;
    
    -- ถ้าเพิ่งรันไป ให้ skip
    IF last_run_time IS NOT NULL AND (now() - last_run_time) < min_interval THEN
        RAISE NOTICE 'Skipping notification check - too recent (last run: %)', last_run_time;
        RETURN;
    END IF;
    
    -- รัน notification check ปกติ
    PERFORM public.check_notification_thresholds();
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Safe notification check failed: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END;
$$;

-- 6. อัพเดท cron job ให้ใช้ safe function
SELECT cron.unschedule('check-notifications-reduced');
SELECT cron.schedule(
    'safe-notifications-check',
    '*/10 * * * *', -- ทุก 10 นาที
    'SELECT public.safe_check_notification_thresholds();'
);