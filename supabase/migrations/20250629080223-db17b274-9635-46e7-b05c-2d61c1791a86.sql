
-- ตรวจสอบและสร้าง RLS policies สำหรับตาราง user_roles ใหม่
-- ลบ policies เก่าก่อน (ถ้ามี)
DROP POLICY IF EXISTS "Admins can manage user roles" ON user_roles;
DROP POLICY IF EXISTS "Superadmins can manage all user roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;

-- สร้าง policy ใหม่ที่อนุญาตให้ admin และ superadmin จัดการ user roles ได้
CREATE POLICY "Admins can manage user roles" 
ON user_roles 
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

-- อนุญาตให้ผู้ใช้ดู roles ของตัวเองได้
CREATE POLICY "Users can view their own roles" 
ON user_roles 
FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- อนุญาตให้ admin และ superadmin ดู roles ของผู้ใช้คนอื่นได้
CREATE POLICY "Admins can view all roles" 
ON user_roles 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);
