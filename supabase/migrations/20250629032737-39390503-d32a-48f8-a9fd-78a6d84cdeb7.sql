
-- Drop ALL existing policies on guest_device_access
DROP POLICY IF EXISTS "Anyone can view enabled guest device access" ON guest_device_access;
DROP POLICY IF EXISTS "Admins can manage guest device access" ON guest_device_access;
DROP POLICY IF EXISTS "Public can view enabled guest device access" ON guest_device_access;
DROP POLICY IF EXISTS "Guests can view enabled device access" ON guest_device_access;
DROP POLICY IF EXISTS "Allow unauthenticated users to view enabled guest device access" ON guest_device_access;

-- Drop existing policies on other tables
DROP POLICY IF EXISTS "Public can view rice quality data for guest-enabled devices" ON rice_quality_analysis;
DROP POLICY IF EXISTS "Allow guest access to enabled devices" ON rice_quality_analysis;
DROP POLICY IF EXISTS "Guests can view data for enabled devices" ON rice_quality_analysis;

DROP POLICY IF EXISTS "Public can view device settings for guest-enabled devices" ON device_settings;
DROP POLICY IF EXISTS "Allow guest access to device settings for enabled devices" ON device_settings;

DROP POLICY IF EXISTS "Public can view notification settings for guest-enabled devices" ON notification_settings;

-- Recreate policies for guest_device_access
CREATE POLICY "Anyone can view enabled guest device access" 
ON guest_device_access 
FOR SELECT 
TO anon, authenticated
USING (enabled = true);

CREATE POLICY "Admins can manage guest device access" 
ON guest_device_access 
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

-- Recreate policies for rice_quality_analysis
CREATE POLICY "Public can view rice quality data for guest-enabled devices" 
ON rice_quality_analysis 
FOR SELECT 
TO anon, authenticated
USING (
  device_code IN (
    SELECT device_code 
    FROM guest_device_access 
    WHERE enabled = true
  )
);

-- Recreate policies for device_settings
CREATE POLICY "Public can view device settings for guest-enabled devices" 
ON device_settings 
FOR SELECT 
TO anon, authenticated
USING (
  device_code IN (
    SELECT device_code 
    FROM guest_device_access 
    WHERE enabled = true
  )
);

-- Recreate policy for notification_settings
CREATE POLICY "Public can view notification settings for guest-enabled devices" 
ON notification_settings 
FOR SELECT 
TO anon, authenticated
USING (
  device_code IN (
    SELECT device_code 
    FROM guest_device_access 
    WHERE enabled = true
  )
);
