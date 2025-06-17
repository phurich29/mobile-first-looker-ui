
import { RiceQualityData } from './types';

export const formatValue = (value: number | null): string => {
  if (value === null || value === undefined) return '-';
  return value.toFixed(2);
};

// ลำดับคอลัมน์ที่ต้องการแสดง
export const COLUMN_ORDER = [
  'created_at', // เปลี่ยนจาก thai_datetime เป็น created_at
  'device_code',
  'class1',
  'class2',
  'class3',
  'short_grain',
  'slender_kernel',
  'whole_kernels',
  'head_rice',
  'total_brokens',
  'small_brokens',
  'small_brokens_c1',
  'red_line_rate',
  'parboiled_red_line',
  'parboiled_white_rice',
  'honey_rice',
  'yellow_rice_rate',
  'black_kernel',
  'partly_black_peck',
  'partly_black',
  'imperfection_rate',
  'sticky_rice_rate',
  'impurity_num',
  'paddy_rate',
  'whiteness',
  'process_precision'
];

export const getColumnKeys = (data: RiceQualityData[]): string[] => {
  if (!data || data.length === 0) return [];
  
  // ใช้ลำดับคอลัมน์ที่กำหนดไว้ล่วงหน้า และกรองคอลัมน์ที่ไม่มีข้อมูล
  return COLUMN_ORDER.filter(key => 
    data[0].hasOwnProperty(key) && 
    !['id', 'thai_datetime', 'sample_index', 'output'].includes(key) // กรอง thai_datetime ออก, ไม่กรอง created_at
  );
};

export const formatCellValue = (key: string, value: any): string => {
  if (key === 'created_at') {
    if (!value) return '-';
    // Assuming value is a UTC timestamp string from Supabase
    const dateObj = new Date(value);

    // เพิ่มเวลา 7 ชั่วโมงเหมือน TimeDisplay.tsx
    dateObj.setHours(dateObj.getHours() + 7);

    const formattedDate = dateObj.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const formattedTime = dateObj.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, // ใช้รูปแบบ 24 ชั่วโมง
    });
    return `${formattedDate} ${formattedTime}`;
  }
  
  if (key === 'device_code') {
    return value?.toString() || '-';
  }
  
  return formatValue(value);
};
