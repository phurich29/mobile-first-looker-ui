-- Delete test notifications with specific message
DELETE FROM public.notifications
WHERE user_id = 'bae7bf0b-2aa4-4f8d-a108-4aebdb388695'
  AND notification_message = '🧪 ทดสอบ: ค่า "ชั้น 1 (>7.0 mm)" (100) สูงกว่าเกณฑ์ที่กำหนดไว้ (70)';