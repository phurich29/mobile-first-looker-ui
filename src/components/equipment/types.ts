
export interface User {
  id: string;
  email: string;
  hasAccess: boolean;
}

export interface Measurement {
  id: number;
  created_at: string;
  device_code: string;
  head_rice?: number;
  total_brokens?: number;
  small_brokens?: number;
  small_brokens_c1?: number;
  whole_kernels?: number;
  short_grain?: number;
  slender_kernel?: number;
  black_kernel?: number;
  partly_black?: number;
  sticky_rice_rate?: number;
  honey_rice?: number;
  parboiled_white_rice?: number;
  parboiled_red_line?: number;
  yellow_rice_rate?: number;
  red_line_rate?: number;
  paddy_rate?: number;
  partly_black_peck?: number;
  imperfection_rate?: number;
  impurity_num?: number;
  whiteness?: number;
  process_precision?: number;
  thai_datetime?: string;
}

export interface MeasurementInfo {
  key: string;
  name: string;
  iconColor: string;
}

// รายการค่าวัดที่เป็นไปได้ทั้งหมด
export const ALL_MEASUREMENTS: MeasurementInfo[] = [
  { key: 'head_rice', name: 'ต้นข้าว', iconColor: '#4CAF50' },
  { key: 'total_brokens', name: 'ปลายข้าว', iconColor: '#FF9800' },
  { key: 'imperfection_rate', name: 'เมล็ดเสีย', iconColor: '#F44336' },
  { key: 'whole_kernels', name: 'เมล็ดเต็ม', iconColor: '#2196F3' },
  { key: 'small_brokens', name: 'ปลายเล็ก', iconColor: '#FFC107' },
  { key: 'small_brokens_c1', name: 'ปลายเล็ก C1', iconColor: '#FF5722' },
  { key: 'short_grain', name: 'เมล็ดสั้น', iconColor: '#9C27B0' },
  { key: 'slender_kernel', name: 'เมล็ดยาว', iconColor: '#607D8B' },
  { key: 'black_kernel', name: 'เมล็ดดำ', iconColor: '#000000' },
  { key: 'partly_black', name: 'เมล็ดดำบางส่วน', iconColor: '#212121' },
  { key: 'sticky_rice_rate', name: 'ข้าวเหนียว', iconColor: '#3F51B5' },
  { key: 'honey_rice', name: 'ข้าวน้ำผึ้ง', iconColor: '#FFEB3B' },
  { key: 'parboiled_white_rice', name: 'ข้าวนึ่งขาว', iconColor: '#E0E0E0' },
  { key: 'parboiled_red_line', name: 'ข้าวนึ่งเส้นแดง', iconColor: '#E53935' },
  { key: 'yellow_rice_rate', name: 'ข้าวเหลือง', iconColor: '#FFC107' },
  { key: 'red_line_rate', name: 'ข้าวเส้นแดง', iconColor: '#D32F2F' },
  { key: 'paddy_rate', name: 'ข้าวเปลือก', iconColor: '#8D6E63' },
  { key: 'partly_black_peck', name: 'เมล็ดดำบางส่วน (จุด)', iconColor: '#424242' },
  { key: 'impurity_num', name: 'สิ่งเจือปน', iconColor: '#795548' },
  { key: 'whiteness', name: 'ความขาว', iconColor: '#FAFAFA' },
  { key: 'process_precision', name: 'ความแม่นยำ', iconColor: '#00BCD4' },
];
