-- Task 4.1: Data Cleanup for old notification_settings records

-- Update any notification_settings records that don't have user_id
-- We'll set them to a default admin user or remove them
DELETE FROM notification_settings WHERE user_id IS NULL;

-- Add NOT NULL constraint to prevent future issues
ALTER TABLE notification_settings ALTER COLUMN user_id SET NOT NULL;

-- Add constraint to ensure valid user_id references
-- (Note: we can't add FK to auth.users, but we can add check constraint)
ALTER TABLE notification_settings 
ADD CONSTRAINT notification_settings_user_id_not_empty 
CHECK (user_id IS NOT NULL AND user_id != '00000000-0000-0000-0000-000000000000'::uuid);

-- Create index for better performance on user_id queries
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON notification_settings(user_id);

-- Add helpful comments
COMMENT ON COLUMN notification_settings.user_id IS 'User ID from auth.users - required for user-specific notifications';
COMMENT ON TABLE notification_settings IS 'User-specific notification settings with proper RLS isolation';