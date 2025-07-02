-- Fix trigger function to handle PostgreSQL error for device 1493
CREATE OR REPLACE FUNCTION public.trigger_check_notifications()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Log trigger activation
  RAISE NOTICE 'Trigger fired: calling check_notification_thresholds for device %', NEW.device_code;
  
  -- Special handling for device 1493 to prevent blocking inserts
  IF NEW.device_code LIKE '%1493%' THEN
    BEGIN
      -- Try to call notification check, but catch any errors
      PERFORM public.check_notification_thresholds();
    EXCEPTION WHEN OTHERS THEN
      -- Log the error but don't block the insert
      RAISE WARNING 'Notification check failed for device % - Error: % (SQLSTATE: %)', 
        NEW.device_code, SQLERRM, SQLSTATE;
      RAISE NOTICE 'Insert will continue despite notification check failure for device %', NEW.device_code;
    END;
  ELSE
    -- Normal behavior for all other devices
    PERFORM public.check_notification_thresholds();
  END IF;
  
  RETURN NEW;
END;
$function$;