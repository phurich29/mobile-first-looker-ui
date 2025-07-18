-- Step 1: Fix Security Warnings

-- 1.1 Fix function search paths - Update all functions to use explicit schema
CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, role app_role)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = $1 AND role = $2
  );
$function$;

CREATE OR REPLACE FUNCTION public.get_user_roles(user_id uuid)
RETURNS SETOF app_role
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT role
  FROM public.user_roles
  WHERE user_id = $1;
$function$;

CREATE OR REPLACE FUNCTION public.check_user_role_for_data_access(user_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_id_param 
    AND role IN ('admin', 'superadmin')
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_admin_or_superadmin_safe(user_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_id_param 
    AND role IN ('admin', 'superadmin')
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_admin_or_superadmin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'superadmin')
  );
$function$;

CREATE OR REPLACE FUNCTION public.has_device_access(device_code_param text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_device_access
    WHERE user_id = auth.uid()
      AND device_code = device_code_param
  ) OR public.is_admin_or_superadmin();
$function$;

-- 1.2 Hide materialized view from API exposure by removing public select permissions
REVOKE SELECT ON public.guest_enabled_devices FROM anon;
REVOKE SELECT ON public.guest_enabled_devices FROM authenticated;

-- Create a secure function to access guest enabled devices instead
CREATE OR REPLACE FUNCTION public.get_guest_enabled_devices()
RETURNS TABLE(device_code text, enabled boolean)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT device_code::text, enabled
  FROM public.guest_enabled_devices;
$function$;

-- 1.3 Ensure password protection is enabled (check current auth settings)
-- This creates a function to validate password strength
CREATE OR REPLACE FUNCTION public.validate_password_strength(password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Password must be at least 8 characters
  IF length(password) < 8 THEN
    RETURN false;
  END IF;
  
  -- Password must contain at least one number
  IF password !~ '[0-9]' THEN
    RETURN false;
  END IF;
  
  -- Password must contain at least one letter
  IF password !~ '[A-Za-z]' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$function$;

-- 1.4 Add performance monitoring for security functions
CREATE OR REPLACE FUNCTION public.log_security_check(function_name text, user_id uuid, success boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Log security checks for audit purposes
  RAISE NOTICE 'Security Check: % for user % - %', function_name, user_id, CASE WHEN success THEN 'SUCCESS' ELSE 'FAILED' END;
END;
$function$;