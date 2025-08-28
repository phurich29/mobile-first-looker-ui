-- Fix the log_notification_settings_change function to handle created_by properly
CREATE OR REPLACE FUNCTION public.log_notification_settings_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Log การสร้างใหม่
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notification_settings_history (
      user_id, device_code, rice_type_id, rice_type_name, 
      action_type, new_settings, created_by
    ) VALUES (
      NEW.user_id, NEW.device_code, NEW.rice_type_id, NEW.rice_type_name,
      'created', 
      jsonb_build_object(
        'enabled', NEW.enabled,
        'min_enabled', NEW.min_enabled,
        'max_enabled', NEW.max_enabled,
        'min_threshold', NEW.min_threshold,
        'max_threshold', NEW.max_threshold
      ),
      COALESCE(auth.uid(), NEW.user_id)  -- Use auth.uid() or fallback to user_id
    );
    RETURN NEW;
  END IF;
  
  -- Log การแก้ไข
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.notification_settings_history (
      user_id, device_code, rice_type_id, rice_type_name,
      action_type, old_settings, new_settings, created_by
    ) VALUES (
      NEW.user_id, NEW.device_code, NEW.rice_type_id, NEW.rice_type_name,
      'updated',
      jsonb_build_object(
        'enabled', OLD.enabled,
        'min_enabled', OLD.min_enabled,
        'max_enabled', OLD.max_enabled,
        'min_threshold', OLD.min_threshold,
        'max_threshold', OLD.max_threshold
      ),
      jsonb_build_object(
        'enabled', NEW.enabled,
        'min_enabled', NEW.min_enabled,
        'max_enabled', NEW.max_enabled,
        'min_threshold', NEW.min_threshold,
        'max_threshold', NEW.max_threshold
      ),
      COALESCE(auth.uid(), NEW.user_id)  -- Use auth.uid() or fallback to user_id
    );
    RETURN NEW;
  END IF;
  
  -- Log การลบ
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.notification_settings_history (
      user_id, device_code, rice_type_id, rice_type_name,
      action_type, old_settings, created_by
    ) VALUES (
      OLD.user_id, OLD.device_code, OLD.rice_type_id, OLD.rice_type_name,
      'deleted',
      jsonb_build_object(
        'enabled', OLD.enabled,
        'min_enabled', OLD.min_enabled,
        'max_enabled', OLD.max_enabled,
        'min_threshold', OLD.min_threshold,
        'max_threshold', OLD.max_threshold
      ),
      COALESCE(auth.uid(), OLD.user_id)  -- Use auth.uid() or fallback to user_id
    );
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$function$;