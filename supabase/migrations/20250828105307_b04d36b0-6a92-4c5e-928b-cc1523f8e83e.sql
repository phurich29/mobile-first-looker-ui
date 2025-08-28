-- ลบ unique constraint เก่าที่ไม่รวม user_id เพื่อให้หลาย user สามารถตั้งค่าแจ้งเตือนสำหรับ device เดียวกันได้
DROP INDEX IF EXISTS notification_settings_device_rice_type_idx;

-- ตรวจสอบให้แน่ใจว่ามี constraint ที่ถูกต้องแล้ว (user_id + device_code + rice_type_id)
-- (constraint นี้มีอยู่แล้วตามชื่อ unique_user_device_rice_type)

-- เพิ่ม index ธรรมดาสำหรับ performance (ไม่ unique)
CREATE INDEX IF NOT EXISTS idx_notification_settings_device_rice_type_non_unique 
ON notification_settings (device_code, rice_type_id);