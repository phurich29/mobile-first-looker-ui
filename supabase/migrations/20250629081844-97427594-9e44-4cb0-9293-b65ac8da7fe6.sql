
-- ลบ policies เก่าที่มีปัญหา recursive
DROP POLICY IF EXISTS "Users can view data for accessible devices" ON rice_quality_analysis;
DROP POLICY IF EXISTS "Admins can manage rice quality data" ON rice_quality_analysis;

-- สร้าง security definer function เพื่อเช็ค user role
CREATE OR REPLACE FUNCTION public.check_user_role_for_data_access(user_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_id_param 
    AND role IN ('admin', 'superadmin')
  );
$$;

-- สร้าง policy ใหม่ที่ใช้ security definer function
CREATE POLICY "Users can view data for accessible devices" 
ON rice_quality_analysis 
FOR SELECT 
TO authenticated 
USING (
  -- ตรวจสอบว่าผู้ใช้มีสิทธิ์เข้าถึงอุปกรณ์นี้ผ่าน user_device_access
  EXISTS (
    SELECT 1 FROM user_device_access 
    WHERE user_id = auth.uid() 
    AND device_code = rice_quality_analysis.device_code::text
  )
  OR
  -- หรือเป็น admin/superadmin (ใช้ security definer function)
  public.check_user_role_for_data_access(auth.uid())
  OR
  -- หรืออุปกรณ์นี้เปิดให้ guest เข้าถึงได้
  EXISTS (
    SELECT 1 FROM guest_device_access 
    WHERE device_code = rice_quality_analysis.device_code::text 
    AND enabled = true
  )
);

-- สร้าง policy สำหรับ admin/superadmin ในการจัดการข้อมูล
CREATE POLICY "Admins can manage rice quality data" 
ON rice_quality_analysis 
FOR ALL 
TO authenticated 
USING (public.check_user_role_for_data_access(auth.uid()))
WITH CHECK (public.check_user_role_for_data_access(auth.uid()));
