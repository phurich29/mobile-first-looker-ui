-- Delete all notification settings for user fongnotcompany@gmail.com
DELETE FROM notification_settings 
WHERE user_id = 'bae7bf0b-2aa4-4f8d-a108-4aebdb388695';

-- Also delete all related notifications for this user
DELETE FROM notifications 
WHERE user_id = 'bae7bf0b-2aa4-4f8d-a108-4aebdb388695';