
-- ลบ table rice_prices_addon
DROP TABLE IF EXISTS public.rice_prices_addon;

-- สร้าง table rice_quality_analysis_addon01 ใหม่แบบเปล่าๆ
CREATE TABLE public.rice_quality_analysis_addon01 (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- เพิ่ม trigger สำหรับ updated_at
CREATE TRIGGER handle_updated_at_rice_quality_analysis_addon01
  BEFORE UPDATE ON public.rice_quality_analysis_addon01
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- เปิดใช้งาน Row Level Security
ALTER TABLE public.rice_quality_analysis_addon01 ENABLE ROW LEVEL SECURITY;

-- สร้าง policy สำหรับการอ่านข้อมูล (อนุญาตให้ทุกคนอ่านได้)
CREATE POLICY "Allow public read access" 
  ON public.rice_quality_analysis_addon01 
  FOR SELECT 
  USING (true);

-- สร้าง policy สำหรับการเขียนข้อมูล (เฉพาะ admin และ superadmin)
CREATE POLICY "Allow admin write access" 
  ON public.rice_quality_analysis_addon01 
  FOR ALL 
  USING (public.is_admin_or_superadmin())
  WITH CHECK (public.is_admin_or_superadmin());
