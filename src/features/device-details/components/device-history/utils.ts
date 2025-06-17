
import { RiceQualityData } from './types';

export const formatValue = (value: number | null): string => {
  if (value === null || value === undefined) return '-';
  return value.toFixed(2);
};

// ลำดับคอลัมน์ที่ต้องการแสดง
export const COLUMN_ORDER = [
  'thai_datetime',
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
    !['id', 'created_at', 'sample_index', 'output'].includes(key)
  );
};

export const formatCellValue = (key: string, value: any): string => {
  if (key === 'thai_datetime') {
    if (!value) return '-';
    
    // ใช้ thai_datetime โดยตรงจากฐานข้อมูลโดยไม่บวกเวลาเพิ่ม
    // สมมติว่า value เป็น string เช่น "2025-06-17T18:20:14.319163+00:00"
    const dateStr = typeof value === 'string' ? value : String(value);
    
    // แยกเฉพาะส่วนวันที่และเวลา ไม่ต้องแปลง timezone
    const date = new Date(dateStr);
    
    // ใช้ toLocaleString แบบไทยโดยไม่กำหนด timezone (ใช้ของ local)
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Bangkok' // บังคับให้ใช้เวลาไทย
    });
  }
  
  if (key === 'device_code') {
    return value?.toString() || '-';
  }
  
  return formatValue(value);
};
