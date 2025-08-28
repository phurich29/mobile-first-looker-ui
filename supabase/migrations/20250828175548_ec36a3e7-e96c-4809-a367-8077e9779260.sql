-- Delete the notification setting that generated this alert
DELETE FROM notification_settings 
WHERE user_id = 'bae7bf0b-2aa4-4f8d-a108-4aebdb388695' 
  AND device_code = '6400000401432' 
  AND rice_type_id = 'class1';

-- Also delete the related notifications
DELETE FROM notifications 
WHERE user_id = 'bae7bf0b-2aa4-4f8d-a108-4aebdb388695' 
  AND device_code = '6400000401432' 
  AND rice_type_id = 'class1' 
  AND notification_message LIKE '%ค่า "ชั้น 1 (>7.0 mm)" (90.7) สูงกว่าเกณฑ์ที่กำหนดไว้ (70)%';