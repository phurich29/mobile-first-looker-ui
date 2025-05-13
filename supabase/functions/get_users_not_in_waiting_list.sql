
CREATE OR REPLACE FUNCTION public.get_users_not_in_waiting_list()
RETURNS TABLE (
  id uuid,
  email text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Get users who have roles other than waiting_list or explicitly have user, admin or superadmin roles
  SELECT DISTINCT p.id, p.email
  FROM public.profiles p
  JOIN public.user_roles ur ON p.id = ur.user_id
  WHERE ur.role != 'waiting_list'::app_role
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur2
    WHERE ur2.user_id = p.id 
    AND ur2.role IN ('user'::app_role, 'admin'::app_role, 'superadmin'::app_role)
  )
  ORDER BY p.email;
$$;
