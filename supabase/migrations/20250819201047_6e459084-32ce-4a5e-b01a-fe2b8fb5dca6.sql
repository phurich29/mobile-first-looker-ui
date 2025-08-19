-- ==========================================
-- แก้ไข Security Issues หลัง Migration
-- ==========================================

-- เปิด RLS สำหรับตารางที่ขาด RLS
ALTER TABLE "Sending Push Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE firebase_fcm_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE firebase_notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE firebase_topic_subscriptions ENABLE ROW LEVEL SECURITY;

-- สร้าง RLS policies สำหรับตาราง Firebase
CREATE POLICY "Users can manage their own FCM tokens"
  ON firebase_fcm_tokens
  FOR ALL
  USING (user_id::uuid = auth.uid())
  WITH CHECK (user_id::uuid = auth.uid());

CREATE POLICY "Admins can view FCM tokens"
  ON firebase_fcm_tokens
  FOR SELECT
  USING (is_admin_or_superadmin_safe(auth.uid()));

CREATE POLICY "System can insert notification logs"
  ON firebase_notification_logs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view notification logs"
  ON firebase_notification_logs
  FOR SELECT
  USING (is_admin_or_superadmin_safe(auth.uid()));

CREATE POLICY "System can manage topic subscriptions"
  ON firebase_topic_subscriptions
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "System can manage push notifications"
  ON "Sending Push Notification"
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- แก้ไข function search path สำหรับ validation function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';