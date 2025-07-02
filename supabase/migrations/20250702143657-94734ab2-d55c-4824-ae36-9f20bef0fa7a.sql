-- Insert admin device visibility settings to hide these devices from regular admins
-- Only super admins will be able to see these devices

DO $$
DECLARE
    superadmin_id UUID;
BEGIN
    -- Get a superadmin user ID
    SELECT ur.user_id INTO superadmin_id
    FROM user_roles ur 
    WHERE ur.role = 'superadmin'::app_role 
    LIMIT 1;
    
    -- If no superadmin found, use the first admin
    IF superadmin_id IS NULL THEN
        SELECT ur.user_id INTO superadmin_id
        FROM user_roles ur 
        WHERE ur.role = 'admin'::app_role 
        LIMIT 1;
    END IF;
    
    -- Insert the device visibility settings
    INSERT INTO admin_device_visibility (device_code, hidden_for_admin, created_by)
    SELECT device_code, true, superadmin_id
    FROM (
        VALUES 
            ('6000306302140'),
            ('6000306302141'), 
            ('6000306302143'),
            ('6000306302144')
    ) AS devices(device_code)
    ON CONFLICT (device_code) 
    DO UPDATE SET 
        hidden_for_admin = true,
        updated_at = now();
END $$;