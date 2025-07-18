-- Phase 2: ทำความสะอาด RLS Policies ที่ขัดแย้งกัน

-- 1. ตรวจสอบและจัดกลุ่ม overlapping policies ใน rice_quality_analysis
-- ลบ policies ที่ซ้ำซ้อนและอาจสร้าง conflicts
DROP POLICY IF EXISTS "Allow guests to view data for enabled devices" ON rice_quality_analysis;
DROP POLICY IF EXISTS "Public can view rice quality data for guest-enabled devices or " ON rice_quality_analysis;
DROP POLICY IF EXISTS "Users can view rice quality data for accessible devices" ON rice_quality_analysis;

-- 2. สร้าง unified access policy เดียวที่ครอบคลุมทุกกรณี
CREATE POLICY "Unified rice quality access" ON rice_quality_analysis
FOR SELECT USING (
  -- Case 1: Guest access - check if device is in guest_device_access
  (device_code::text IN (
    SELECT device_code FROM guest_device_access WHERE enabled = true
  ))
  OR
  -- Case 2: User access - check if user has device access
  (auth.uid() IS NOT NULL AND device_code::text IN (
    SELECT device_code FROM user_device_access WHERE user_id = auth.uid()
  ))
  OR
  -- Case 3: Admin/Superadmin access - use security definer function
  (auth.uid() IS NOT NULL AND public.is_admin_or_superadmin_safe(auth.uid()))
  OR
  -- Case 4: Shared link access
  (id IN (
    SELECT analysis_id FROM shared_analysis_links 
    WHERE is_active = true AND (expires_at IS NULL OR expires_at > now())
  ))
);

-- 3. ทำความสะอาด device_settings policies ที่ซ้ำซ้อน
DROP POLICY IF EXISTS "Allow authenticated users to select devices" ON device_settings;
DROP POLICY IF EXISTS "Allow read access to device settings for all users" ON device_settings;
DROP POLICY IF EXISTS "Public can view device settings for guest-enabled devices or sh" ON device_settings;
DROP POLICY IF EXISTS "Users can only see authorized devices" ON device_settings;

-- สร้าง unified policy สำหรับ device_settings
CREATE POLICY "Unified device settings access" ON device_settings
FOR SELECT USING (
  -- Guest access
  (device_code IN (SELECT device_code FROM guest_device_access WHERE enabled = true))
  OR
  -- User access
  (auth.uid() IS NOT NULL AND device_code IN (
    SELECT device_code FROM user_device_access WHERE user_id = auth.uid()
  ))
  OR
  -- Admin access
  (auth.uid() IS NOT NULL AND public.is_admin_or_superadmin_safe(auth.uid()))
  OR
  -- Shared access
  (device_code IN (
    SELECT DISTINCT (rqa.device_code)::text 
    FROM rice_quality_analysis rqa
    JOIN shared_analysis_links sal ON (rqa.id = sal.analysis_id)
    WHERE sal.is_active = true AND (sal.expires_at IS NULL OR sal.expires_at > now())
  ))
);

-- 4. ทำความสะอาด notification_settings policies
DROP POLICY IF EXISTS "Allow anyone to view notification settings" ON notification_settings;
DROP POLICY IF EXISTS "Public can view notification settings for guest-enabled devices" ON notification_settings;
DROP POLICY IF EXISTS "Users can view their own notification settings or shared ones" ON notification_settings;

-- สร้าง simplified notification policy
CREATE POLICY "Unified notification settings access" ON notification_settings
FOR SELECT USING (
  -- User's own settings
  (user_id = auth.uid())
  OR
  -- Shared/global settings (user_id is null)
  (user_id IS NULL)
  OR
  -- Guest access for enabled devices
  (device_code IN (SELECT device_code FROM guest_device_access WHERE enabled = true))
  OR
  -- Admin access
  (auth.uid() IS NOT NULL AND public.is_admin_or_superadmin_safe(auth.uid()))
);

-- 5. สร้าง performance monitoring function เพื่อติดตาม policy conflicts
CREATE OR REPLACE FUNCTION public.monitor_policy_performance()
RETURNS TABLE(
  table_name text,
  policy_count bigint,
  avg_check_time_ms numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- ตรวจสอบจำนวน policies ต่อตาราง
  RETURN QUERY
  SELECT 
    t.tablename::text,
    COUNT(p.policyname)::bigint as policy_count,
    0::numeric as avg_check_time_ms -- placeholder สำหรับ future monitoring
  FROM pg_tables t
  LEFT JOIN pg_policies p ON t.tablename = p.tablename
  WHERE t.schemaname = 'public'
    AND t.tablename IN ('rice_quality_analysis', 'device_settings', 'notification_settings')
  GROUP BY t.tablename
  ORDER BY policy_count DESC;
END;
$$;

-- 6. เพิ่ม index เพื่อเพิ่มประสิทธิภาพ RLS checks
CREATE INDEX IF NOT EXISTS idx_guest_device_access_enabled 
ON guest_device_access(device_code) WHERE enabled = true;

CREATE INDEX IF NOT EXISTS idx_user_device_access_lookup 
ON user_device_access(user_id, device_code);

CREATE INDEX IF NOT EXISTS idx_shared_analysis_active 
ON shared_analysis_links(analysis_id) WHERE is_active = true;