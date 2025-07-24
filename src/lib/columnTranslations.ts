import { useTranslation } from "@/hooks/useTranslation";

export const getColumnThaiName = (columnName: string): string => {
  // We'll use this temporarily, but components should use useTranslation directly
  return columnTranslations[columnName] || columnName;
};

export const getMeasurementThaiName = (measurementName: string): string => {
  return measurementTranslations[measurementName] || measurementName;
};

export const getAllColumnTranslations = (): Record<string, string> => {
  return columnTranslations;
};

export const hasTranslation = (columnName: string): boolean => {
  return !!columnTranslations[columnName];
};

export const measurementTranslations: Record<string, string> = {
  class1: 'ชั้น 1 (>7.0mm)',
  class2: 'ชั้น 2 (>6.6-7.0mm)',
  class3: 'ชั้น 3 (>6.2-6.6mm)',
  short_grain: 'เมล็ดสั้น',
  slender_kernel: 'ข้าวลีบ',
  whole_kernels: 'เต็มเมล็ด',
  head_rice: 'ต้นข้าว',
  total_brokens: 'ข้าวหักรวม',
  small_brokens: 'ปลายข้าว',
  small_brokens_c1: 'ปลายข้าวC1',
  red_line_rate: 'สีต่ำกว่ามาตรฐาน',
  parboiled_red_line: 'เมล็ดแดง',
  parboiled_white_rice: 'ข้าวดิบ',
  honey_rice: 'เมล็ดม่วง',
  yellow_rice_rate: 'เมล็ดเหลือง',
  black_kernel: 'เมล็ดดำ',
  partly_black_peck: 'ดำบางส่วน & จุดดำ',
  partly_black: 'ดำบางส่วน',
  imperfection_rate: 'เมล็ดเสีย',
  sticky_rice_rate: 'ข้าวเหนียว',
  impurity_num: 'เมล็ดอื่นๆ',
  paddy_rate: 'ข้าวเปลือก(เมล็ด/กก.)',
  whiteness: 'ความขาว',
  process_precision: 'ระดับขัดสี',
  mix_rate: 'อัตราส่วนผสม',
  sprout_rate: 'อัตราการงอก',
  unripe_rate: 'อัตราการไม่สุก',
  brown_rice_rate: 'อัตราข้าวกล้อง',
  main_rate: 'อัตราหลัก',
  mix_index: 'ดัชนีผสม',
  main_index: 'ดัชนีหลัก',
};

export const columnTranslations: Record<string, string> = {
  created_at: 'วันที่บันทึก',
  device_code: 'รหัสเครื่อง',
  class1: 'ชั้น 1 (>7.0mm)',
  class2: 'ชั้น 2 (>6.6-7.0mm)',
  class3: 'ชั้น 3 (>6.2-6.6mm)',
  short_grain: 'เมล็ดสั้น',
  slender_kernel: 'ข้าวลีบ',
  whole_kernels: 'เต็มเมล็ด',
  head_rice: 'ต้นข้าว',
  total_brokens: 'ข้าวหักรวม',
  small_brokens: 'ปลายข้าว',
  small_brokens_c1: 'ปลายข้าวC1',
  red_line_rate: 'สีต่ำกว่ามาตรฐาน',
  parboiled_red_line: 'เมล็ดแดง',
  parboiled_white_rice: 'ข้าวดิบ',
  honey_rice: 'เมล็ดม่วง',
  yellow_rice_rate: 'เมล็ดเหลือง',
  black_kernel: 'เมล็ดดำ',
  partly_black_peck: 'ดำบางส่วน & จุดดำ',
  partly_black: 'ดำบางส่วน',
  imperfection_rate: 'เมล็ดเสีย',
  sticky_rice_rate: 'ข้าวเหนียว',
  impurity_num: 'เมล็ดอื่นๆ',
  paddy_rate: 'ข้าวเปลือก(เมล็ด/กก.)',
  whiteness: 'ความขาว',
  process_precision: 'ระดับขัดสี',
  
  // New columns - using column names as display names for now
  mix_rate: 'mix_rate',
  sprout_rate: 'sprout_rate', 
  unripe_rate: 'unripe_rate',
  brown_rice_rate: 'brown_rice_rate',
  main_rate: 'main_rate',
  mix_index: 'mix_index',
  main_index: 'main_index',
};
