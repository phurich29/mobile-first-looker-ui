
-- Drop duplicate guest device access policies if they exist
DROP POLICY IF EXISTS "Allow guest users to view enabled devices" ON guest_device_access;
DROP POLICY IF EXISTS "Guests can view enabled device access" ON guest_device_access;
DROP POLICY IF EXISTS "Allow unauthenticated users to view enabled guest device access" ON guest_device_access;

-- Create single, clear RLS policy for guest device access
CREATE POLICY "Public can view enabled guest device access" 
ON guest_device_access 
FOR SELECT 
USING (enabled = true);

-- Ensure RLS is enabled
ALTER TABLE guest_device_access ENABLE ROW LEVEL SECURITY;

-- Drop any conflicting policies on rice_quality_analysis for guest access
DROP POLICY IF EXISTS "Allow guest access to enabled devices" ON rice_quality_analysis;
DROP POLICY IF EXISTS "Guests can view data for enabled devices" ON rice_quality_analysis;
DROP POLICY IF EXISTS "Public can view data for guest-enabled devices" ON rice_quality_analysis;

-- Create clear policy for guest access to rice quality analysis
CREATE POLICY "Public can view rice quality data for guest-enabled devices" 
ON rice_quality_analysis 
FOR SELECT 
USING (
  device_code IN (
    SELECT device_code 
    FROM guest_device_access 
    WHERE enabled = true
  )
);

-- Drop conflicting policies on device_settings for guest access
DROP POLICY IF EXISTS "Allow guest access to device settings for enabled devices" ON device_settings;
DROP POLICY IF EXISTS "Public can view device settings for guest devices" ON device_settings;

-- Create policy for guest access to device settings
CREATE POLICY "Public can view device settings for guest-enabled devices" 
ON device_settings 
FOR SELECT 
USING (
  device_code IN (
    SELECT device_code 
    FROM guest_device_access 
    WHERE enabled = true
  )
);
