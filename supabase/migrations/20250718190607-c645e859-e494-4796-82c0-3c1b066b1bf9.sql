-- เพิ่ม indexes เพื่อเพิ่มประสิทธิภาพ queries ที่ใช้บ่อย
CREATE INDEX IF NOT EXISTS idx_rice_quality_analysis_device_created 
ON rice_quality_analysis (device_code, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_device_access_user_id 
ON user_device_access (user_id);

CREATE INDEX IF NOT EXISTS idx_guest_device_access_enabled 
ON guest_device_access (enabled) WHERE enabled = true;