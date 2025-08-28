import { useTranslation } from "@/hooks/useTranslation";

export const getColumnTranslatedName = (columnName: string, language: 'th' | 'en' | 'zh' = 'th'): string => {
  let translations;
  switch (language) {
    case 'en': translations = columnTranslationsEn; break;
    case 'zh': translations = columnTranslationsZh; break;
    default: translations = columnTranslations; break;
  }
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
  // New columns
  cur_material: 'วัตถุดิบและชนิดข้าว',
  cur_variety: 'มาตรฐาน',
  simple_index: 'พอร์ตอุปกรณ์',
  msg_id: 'เวลา_msg',
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
  // New columns
  cur_material: 'Rice Type',
  cur_variety: 'Standard',
  simple_index: 'Device Port',
  msg_id: 'Message Time',
};

export const columnTranslationsZh: Record<string, string> = {
  created_at: '记录日期',
  device_code: '设备代码',
  class1: '一级 (>7.0mm)',
  class2: '二级 (>6.6-7.0mm)',
  class3: '三级 (>6.2-6.6mm)',
  short_grain: '短粒',
  slender_kernel: '窄米',
  whole_kernels: '整粒',
  head_rice: '米尖破碎',
  total_brokens: '总碎米',
  small_brokens: '小碎米',
  small_brokens_c1: '小碎米C1',
  red_line_rate: '低于标准颜色',
  parboiled_red_line: '红线米',
  parboiled_white_rice: '白米',
  honey_rice: '紫米粒',
  yellow_rice_rate: '黄',
  black_kernel: '黑粒米',
  partly_black_peck: '黑斑及黑点米',
  partly_black: '黑斑米',
  imperfection_rate: '不完善',
  sticky_rice_rate: '糯米',
  impurity_num: '杂质',
  paddy_rate: '稻谷 (粒/公斤)',
  whiteness: '白度',
  process_precision: '大米等级',
  mix_rate: '混合率',
  sprout_rate: '发芽率',
  unripe_rate: '未熟率',
  brown_rice_rate: '糙米率',
  main_rate: '主要率',
  mix_index: '混合指数',
  main_index: '主要指数',
  // New columns
  cur_material: '大米种类',
  cur_variety: '标准',
  simple_index: '设备端口',
  msg_id: '消息时间',
};
