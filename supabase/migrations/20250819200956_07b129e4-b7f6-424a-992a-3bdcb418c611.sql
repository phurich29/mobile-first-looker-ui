-- ==========================================
-- PHASE 1.1: Fix user_id constraints and RLS policies
-- ==========================================

-- ก่อนอื่นต้องทำความสะอาดข้อมูลเก่าที่ไม่มี user_id
-- อัพเดทข้อมูลเก่าที่มี user_id = NULL ให้เป็น system user หรือลบออก
DELETE FROM notification_settings WHERE user_id IS NULL;

-- แก้ไข notification_settings table
-- เปลี่ยน user_id ให้ไม่เป็น nullable
ALTER TABLE notification_settings ALTER COLUMN user_id SET NOT NULL;

-- เพิ่ม constraint เพื่อป้องกันการซ้ำ (user + device + rice_type ต้องไม่ซ้ำ)
ALTER TABLE notification_settings 
ADD CONSTRAINT unique_user_device_rice_type 
UNIQUE (user_id, device_code, rice_type_id);

-- ทำความสะอาดข้อมูลใน notifications table
UPDATE notifications 
SET user_id = (
  SELECT ns.user_id 
  FROM notification_settings ns 
  WHERE ns.device_code = notifications.device_code 
    AND ns.rice_type_id = notifications.rice_type_id 
  LIMIT 1
) 
WHERE user_id IS NULL;

-- ลบการแจ้งเตือนที่ไม่สามารถระบุ user_id ได้
DELETE FROM notifications WHERE user_id IS NULL;

-- แก้ไข notifications table ให้ user_id ไม่เป็น nullable
ALTER TABLE notifications ALTER COLUMN user_id SET NOT NULL;

-- ลบ RLS policies เก่าที่อาจจะทำให้เกิดปัญหา
DROP POLICY IF EXISTS "Allow public read notifications" ON notifications;
DROP POLICY IF EXISTS "Allow public insert notifications" ON notifications;
DROP POLICY IF EXISTS "Unified notification settings access" ON notification_settings;

-- สร้าง RLS policies ใหม่ที่เข้มงวดกว่า
-- สำหรับ notification_settings
CREATE POLICY "Users can only view their own notification settings"
  ON notification_settings
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can only insert their own notification settings"
  ON notification_settings
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can only update their own notification settings"
  ON notification_settings
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can only delete their own notification settings"
  ON notification_settings
  FOR DELETE
  USING (user_id = auth.uid());

-- Admin สามารถดูการตั้งค่าทั้งหมดได้
CREATE POLICY "Admins can view all notification settings"
  ON notification_settings
  FOR SELECT
  USING (is_admin_or_superadmin_safe(auth.uid()));

-- สำหรับ notifications
CREATE POLICY "Users can only view their own notifications"
  ON notifications
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications for specific users"
  ON notifications
  FOR INSERT
  WITH CHECK (user_id IS NOT NULL);

CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own notifications"
  ON notifications
  FOR DELETE
  USING (user_id = auth.uid());

-- Admin สามารถจัดการการแจ้งเตือนทั้งหมดได้
CREATE POLICY "Admins can manage all notifications"
  ON notifications
  FOR ALL
  USING (is_admin_or_superadmin_safe(auth.uid()))
  WITH CHECK (is_admin_or_superadmin_safe(auth.uid()));

-- เพิ่ม index สำหรับ performance
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_device 
ON notification_settings(user_id, device_code);

CREATE INDEX IF NOT EXISTS idx_notifications_user_timestamp 
ON notifications(user_id, timestamp DESC);

-- เพิ่ม comment สำหรับ documentation
COMMENT ON COLUMN notification_settings.user_id IS 'User ID from auth.users - required for proper user isolation';
COMMENT ON COLUMN notifications.user_id IS 'User ID from auth.users - required for proper user isolation';

-- สร้าง function สำหรับ validation
CREATE OR REPLACE FUNCTION validate_notification_user_access()
RETURNS TRIGGER AS $$
BEGIN
  -- ตรวจสอบว่า user มีสิทธิ์เข้าถึง device นี้หรือไม่
  IF NOT EXISTS (
    SELECT 1 FROM user_device_access 
    WHERE user_id = NEW.user_id AND device_code = NEW.device_code
  ) AND NOT is_admin_or_superadmin_safe(NEW.user_id) THEN
    RAISE EXCEPTION 'User does not have access to this device';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- เพิ่ม trigger สำหรับ validation
CREATE TRIGGER validate_notification_settings_access
  BEFORE INSERT OR UPDATE ON notification_settings
  FOR EACH ROW EXECUTE FUNCTION validate_notification_user_access();