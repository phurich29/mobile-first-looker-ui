-- Phase 1: Fix RLS Policies for QR Code Sharing

-- Step 1: Update rice_quality_analysis RLS policy
DROP POLICY IF EXISTS "Public can view rice quality data for guest-enabled devices" ON rice_quality_analysis;

CREATE POLICY "Public can view rice quality data for guest-enabled devices or shared links" 
ON rice_quality_analysis FOR SELECT TO anon, authenticated
USING (
  -- Original guest device access condition
  ((device_code)::text IN (
    SELECT guest_device_access.device_code
    FROM guest_device_access
    WHERE guest_device_access.enabled = true
  ))
  OR
  -- New shared link access condition
  (id IN (
    SELECT sal.analysis_id 
    FROM shared_analysis_links sal 
    WHERE sal.is_active = true 
    AND (sal.expires_at IS NULL OR sal.expires_at > now())
  ))
);

-- Step 2: Update device_settings RLS policy  
DROP POLICY IF EXISTS "Public can view device settings for guest-enabled devices" ON device_settings;

CREATE POLICY "Public can view device settings for guest-enabled devices or shared analysis" 
ON device_settings FOR SELECT TO anon, authenticated
USING (
  -- Original guest device access condition
  (device_code IN (
    SELECT guest_device_access.device_code
    FROM guest_device_access
    WHERE guest_device_access.enabled = true
  ))
  OR
  -- New shared analysis device access condition
  (device_code IN (
    SELECT DISTINCT rqa.device_code::text
    FROM rice_quality_analysis rqa
    INNER JOIN shared_analysis_links sal ON rqa.id = sal.analysis_id
    WHERE sal.is_active = true 
    AND (sal.expires_at IS NULL OR sal.expires_at > now())
  ))
);

-- Step 3: Add performance indexes
CREATE INDEX IF NOT EXISTS idx_shared_analysis_token_active 
ON shared_analysis_links (share_token, is_active, expires_at);

CREATE INDEX IF NOT EXISTS idx_rice_quality_analysis_device_code 
ON rice_quality_analysis (device_code);

-- Step 4: Add index for better JOIN performance
CREATE INDEX IF NOT EXISTS idx_shared_analysis_links_analysis_id 
ON shared_analysis_links (analysis_id) WHERE is_active = true;