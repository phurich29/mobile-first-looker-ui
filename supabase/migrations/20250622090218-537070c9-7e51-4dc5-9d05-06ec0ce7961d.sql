
-- เปิดใช้งาน Row Level Security สำหรับ table notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- สร้าง policy สำหรับการอ่านข้อมูล (อนุญาตให้ทุกคนอ่านได้)
CREATE POLICY "Allow public read notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (true);

-- สร้าง policy สำหรับการเขียนข้อมูล (อนุญาตให้ทุกคนสร้างได้)
CREATE POLICY "Allow public insert notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (true);

-- สร้าง policy สำหรับการแก้ไขข้อมูล (เฉพาะ admin และ superadmin)
CREATE POLICY "Allow admin update notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (public.is_admin_or_superadmin());

-- สร้าง policy สำหรับการลบข้อมูล (เฉพาะ admin และ superadmin)
CREATE POLICY "Allow admin delete notifications" 
  ON public.notifications 
  FOR DELETE 
  USING (public.is_admin_or_superadmin());

-- เซ็ต REPLICA IDENTITY สำหรับ realtime (อาจมีอยู่แล้วแต่ไม่เป็นไร)
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
