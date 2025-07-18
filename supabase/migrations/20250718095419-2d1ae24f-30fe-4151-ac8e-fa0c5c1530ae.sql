-- 1. เพิ่ม index สำหรับ guest_device_access.enabled
CREATE INDEX IF NOT EXISTS idx_guest_device_access_enabled 
ON guest_device_access (enabled) WHERE enabled = true;

-- 2. เพิ่ม materialized view สำหรับ guest devices (cache ผลลัพธ์)
CREATE MATERIALIZED VIEW guest_enabled_devices AS
SELECT device_code, enabled
FROM guest_device_access 
WHERE enabled = true;

-- 3. สร้าง composite index สำหรับการ query ที่ใช้บ่อย
CREATE INDEX IF NOT EXISTS idx_rice_quality_analysis_device_created_composite 
ON rice_quality_analysis (device_code, created_at DESC) 
WHERE device_code IS NOT NULL AND device_code <> '';

-- Initial refresh of materialized view
REFRESH MATERIALIZED VIEW guest_enabled_devices;