
-- Drop ALL policies that might reference the user_roles table or app_role enum
-- Rice prices policies
DROP POLICY IF EXISTS "Superadmins can do anything with rice prices" ON rice_prices;
DROP POLICY IF EXISTS "Superadmins can do anything with rice price documents" ON rice_price_documents;

-- Device access policies
DROP POLICY IF EXISTS "Admins can manage device access" ON user_device_access;
DROP POLICY IF EXISTS "Users can view their own device access" ON user_device_access;

-- Device settings policies
DROP POLICY IF EXISTS "Admins can see all devices" ON device_settings;
DROP POLICY IF EXISTS "Superadmins can manage all device settings" ON device_settings;
DROP POLICY IF EXISTS "Admins can manage device settings" ON device_settings;

-- News policies
DROP POLICY IF EXISTS "Admins can manage news" ON news;
DROP POLICY IF EXISTS "Superadmins can manage news" ON news;
DROP POLICY IF EXISTS "Admins can do everything with news" ON news;

-- User roles policies (these were causing the error)
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON user_roles;
DROP POLICY IF EXISTS "Superadmins can manage all user roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Superadmins can update roles" ON user_roles;

-- Notification settings policies
DROP POLICY IF EXISTS "Admins can manage notification settings" ON notification_settings;
DROP POLICY IF EXISTS "Users can manage their own notification settings" ON notification_settings;

-- Drop functions that depend on the app_role enum
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);
DROP FUNCTION IF EXISTS public.get_user_roles(uuid);

-- Remove waiting_list from app_role enum and update related data
-- First, update any users who only have waiting_list role to have user role instead
UPDATE user_roles 
SET role = 'user' 
WHERE role = 'waiting_list' 
AND user_id NOT IN (
  SELECT DISTINCT user_id 
  FROM user_roles 
  WHERE role IN ('user', 'admin', 'superadmin')
);

-- Delete remaining waiting_list roles
DELETE FROM user_roles WHERE role = 'waiting_list';

-- Recreate the app_role enum without waiting_list
ALTER TYPE app_role RENAME TO app_role_old;
CREATE TYPE app_role AS ENUM ('user', 'admin', 'superadmin');

-- Update the user_roles table to use the new enum
ALTER TABLE user_roles ALTER COLUMN role TYPE app_role USING role::text::app_role;

-- Drop the old enum type
DROP TYPE app_role_old;

-- Recreate the functions
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

-- Recreate all the dropped RLS policies
CREATE POLICY "Superadmins can do anything with rice prices" 
ON rice_prices 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'superadmin'
  )
);

CREATE POLICY "Superadmins can do anything with rice price documents" 
ON rice_price_documents 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'superadmin'
  )
);

CREATE POLICY "Admins can manage device access" 
ON user_device_access 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Users can view their own device access" 
ON user_device_access 
FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Admins can see all devices" 
ON device_settings 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Admins can do everything with news" 
ON news 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Update the assign_default_role_on_signup function to assign 'user' role instead of 'waiting_list'
CREATE OR REPLACE FUNCTION public.assign_default_role_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Assign default 'user' role to new signups
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = new.id AND role = 'user') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'user'::app_role);
  END IF;
  
  -- Special demo cases
  IF new.email LIKE '%admin%' AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = new.id AND role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'admin'::app_role);
    
    IF new.email LIKE '%superadmin%' AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = new.id AND role = 'superadmin') THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (new.id, 'superadmin'::app_role);
    END IF;
  END IF;
  
  RETURN new;
END;
$function$
