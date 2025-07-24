import { useTranslation } from "@/hooks/useTranslation";

export const getColumnTranslatedName = (columnName: string, language: 'th' | 'en' = 'th'): string => {
  const translations = language === 'en' ? columnTranslationsEn : columnTranslations;
  return translations[columnName] || columnName;
};

// Keep for backward compatibility
export const getColumnThaiName = (columnName: string): string => {
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

export const columnTranslationsEn: Record<string, string> = {
  created_at: 'Date Recorded',
  device_code: 'Device Code',
  class1: 'Class 1 (>7.0mm)',
  class2: 'Class 2 (>6.6-7.0mm)',
  class3: 'Class 3 (>6.2-6.6mm)',
  short_grain: 'Short Grain',
  slender_kernel: 'Slender Kernel',
  whole_kernels: 'Whole Kernels',
  head_rice: 'Head Rice',
  total_brokens: 'Total Broken',
  small_brokens: 'Small Broken',
  small_brokens_c1: 'Small Broken C1',
  red_line_rate: 'Below Standard Color',
  parboiled_red_line: 'Red Kernels',
  parboiled_white_rice: 'Raw Rice',
  honey_rice: 'Purple Kernels',
  yellow_rice_rate: 'Yellow Kernels',
  black_kernel: 'Black Kernels',
  partly_black_peck: 'Partly Black & Black Spots',
  partly_black: 'Partly Black',
  imperfection_rate: 'Damaged Kernels',
  sticky_rice_rate: 'Sticky Rice',
  impurity_num: 'Other Kernels',
  paddy_rate: 'Paddy (kernels/kg)',
  whiteness: 'Whiteness',
  process_precision: 'Milling Level',
  mix_rate: 'Mix Rate',
  sprout_rate: 'Sprout Rate',
  unripe_rate: 'Unripe Rate',
  brown_rice_rate: 'Brown Rice Rate',
  main_rate: 'Main Rate',
  mix_index: 'Mix Index',
  main_index: 'Main Index',
};
