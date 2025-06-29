
-- เปิดใช้งาน RLS สำหรับตาราง rice_quality_analysis
ALTER TABLE public.rice_quality_analysis ENABLE ROW LEVEL SECURITY;

-- สร้าง policy ที่อนุญาตให้ผู้ใช้ดูข้อมูลของอุปกรณ์ที่มีสิทธิ์เข้าถึง
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
  -- หรือเป็น admin/superadmin
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
  OR
  -- หรืออุปกรณ์นี้เปิดให้ guest เข้าถึงได้
  EXISTS (
    SELECT 1 FROM guest_device_access 
    WHERE device_code = rice_quality_analysis.device_code::text 
    AND enabled = true
  )
);

-- เพิ่มเติม policy สำหรับการ INSERT, UPDATE, DELETE ถ้าจำเป็น (สำหรับ admin/superadmin)
CREATE POLICY "Admins can manage rice quality data" 
ON rice_quality_analysis 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);
