-- Insert admin device visibility settings to hide these devices from regular admins
-- Only super admins will be able to see these devices

INSERT INTO admin_device_visibility (device_code, hidden_for_admin, created_by)
SELECT device_code, true, (SELECT id FROM auth.users WHERE email LIKE '%superadmin%' LIMIT 1)
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