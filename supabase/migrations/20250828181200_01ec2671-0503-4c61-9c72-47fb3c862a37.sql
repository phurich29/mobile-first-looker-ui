-- ลบ notification_settings ที่ปิดการใช้งาน (enabled = false) ของ user fongnotcompany
DELETE FROM notification_settings 
WHERE user_id = 'bae7bf0b-2aa4-4f8d-a108-4aebdb388695' 
  AND enabled = false;