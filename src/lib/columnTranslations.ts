
/**
 * ไฟล์ศูนย์กลางสำหรับการแปลชื่อคอลัมน์เป็นภาษาไทย
 * Central file for column name translations to Thai
 * 
 * *** สำคัญ: ทุกครั้งที่ต้องการแสดงชื่อคอลัมน์ภาษาไทย ให้ใช้ไฟล์นี้เท่านั้น ***
 * *** IMPORTANT: Always use this file for Thai column name translations ***
 * 
 * วิธีใช้งาน / Usage:
 * import { getColumnThaiName } from '@/lib/columnTranslations';
 * const thaiName = getColumnThaiName('class1'); // returns "ชั้น 1 (>7.0mm)"
 * 
 * หากต้องการเพิ่มหรือแก้ไขคำแปล กรุณาแก้ไขใน COLUMN_TRANSLATIONS ด้านล่าง
 * To add or edit translations, please modify COLUMN_TRANSLATIONS below
 */

/**
 * การแปลชื่อคอลัมน์เป็นภาษาไทย
 * จัดกลุ่มตามประเภทข้อมูลเพื่อง่ายต่อการจัดการ
 */
export const COLUMN_TRANSLATIONS: Record<string, string> = {
  // ========== ข้อมูลเมล็ดข้าว (Rice Grain Data) ==========
  'class1': 'ชั้น 1 (>7.0mm)',
  'class2': 'ชั้น 2 (>6.6-7.0mm)',
  'class3': 'ชั้น 3 (>6.2-6.6mm)',
  'short_grain': 'เมล็ดสั้น (≤6.2mm)',
  'slender_kernel': 'ข้าวลีบ',
  'whole_kernels': 'เต็มเมล็ด',
  'head_rice': 'ต้นข้าว',
  'total_brokens': 'ข้าวหักรวม',
  'small_brokens': 'ปลายข้าว',
  'small_brokens_c1': 'ปลายข้าว C1',
  'red_line_rate': 'สีต่ำกว่ามาตรฐาน',
  'parboiled_red_line': 'เมล็ดแดง',
  'parboiled_white_rice': 'ข้าวดิบ',
  'honey_rice': 'เมล็ดม่วง',
  'yellow_rice_rate': 'เมล็ดเหลือง',
  'black_kernel': 'เมล็ดดำ',
  'partly_black_peck': 'ดำบางส่วน & จุดดำ',
  'partly_black': 'ดำบางส่วน',
  'imperfection_rate': 'เมล็ดเสีย',
  'sticky_rice_rate': 'ข้าวเหนียว',
  'impurity_num': 'เมล็ดอื่นๆ',
  'paddy_rate': 'ข้าวเปลือก (เมล็ด/กก.)',
  'whiteness': 'ความขาว',
  'process_precision': 'ระดับขัดสี',
  
  // ========== ข้อมูลทั่วไป (General Information) ==========
  'thai_datetime': 'วันที่-เวลา',
  'device_code': 'รหัสเครื่อง',
  'created_at': 'วันที่บันทึก',
  'updated_at': 'วันที่อัปเดต',
  'date': 'วันที่',
  'time': 'เวลา',
  'id': 'รหัส',
  'batch_id': 'รหัสล็อต',
  'user_id': 'ผู้ใช้งาน',
  'status': 'สถานะ',
  'notes': 'หมายเหตุ',
  'measurement_time': 'เวลาวัด',
  'measurement_date': 'วันที่วัด',
  'measurement_datetime': 'วันและเวลาวัด',
  'device_name': 'ชื่ออุปกรณ์',
  'location': 'สถานที่',
  'operator': 'ผู้ดำเนินการ',
  'shift': 'กะการทำงาน',
  'lot_number': 'หมายเลขล็อต',
  'sample_id': 'รหัสตัวอย่าง',
  'sample_weight': 'น้ำหนักตัวอย่าง (กรัม)',
  
  // ========== Legacy Mappings (for backward compatibility) ==========
  '70mm': 'ชั้น 1 (>7.0mm)',
  'shortgrain': 'เมล็ดสั้น',
  'slenderkernel': 'เมล็ดยาว',
  'wholekernels': 'เมล็ดเต็ม',
  'headrice': 'ข้าวหัว',
  'totalbrokens': 'ข้าวหักรวม',
  'smallbrokens': 'ปลายข้าว',
  'smallbrokesc1': 'ปลายข้าว C1',
  'redlinerate': 'เส้นแดง',
  'parboiledredline': 'ข้าวสุกเส้นแดง',
  'parboiledwhiterice': 'ข้าวสุกขาว',
  'honeyrice': 'ข้าวน้ำผึ้ง',
  'yellowricerate': 'ข้าวเหลือง',
  'blackkernel': 'เมล็ดดำ',
  'partlyblackpeck': 'จุดดำบางส่วน',
  'partlyblack': 'ดำบางส่วน',
  'imperfectionrate': 'เมล็ดเสีย',
  'stickyricerate': 'ข้าวเหนียว',
  'impuritynum': 'สิ่งเจือปน',
  'paddyrate': 'ข้าวเปลือก',
  'processprecision': 'ความแม่นยำ'
};

/**
 * ฟังก์ชันหลักสำหรับการแปลชื่อคอลัมน์เป็นภาษาไทย
 * Main function to get Thai column name translation
 * 
 * @param key - ชื่อคอลัมน์ภาษาอังกฤษ / English column name
 * @returns ชื่อภาษาไทย หรือชื่อเดิมหากไม่พบคำแปล / Thai name or original name if not found
 */
export const getColumnThaiName = (key: string): string => {
  if (!key) return '';
  
  // Convert to lowercase for case-insensitive matching
  const normalizedKey = key.toLowerCase();
  const translation = COLUMN_TRANSLATIONS[normalizedKey] || COLUMN_TRANSLATIONS[key];
  
  if (!translation) {
    // Log warning for missing translations in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`⚠️ Missing Thai translation for column: "${key}"`);
    }
    return key; // Return original key as fallback
  }
  
  return translation;
};

/**
 * ฟังก์ชันสำหรับดึงคำแปลทั้งหมด
 * Function to get all translations
 */
export const getAllColumnTranslations = (): Record<string, string> => {
  return { ...COLUMN_TRANSLATIONS };
};

/**
 * ฟังก์ชันตรวจสอบว่ามีคำแปลหรือไม่
 * Function to check if translation exists
 */
export const hasTranslation = (key: string): boolean => {
  return !!(COLUMN_TRANSLATIONS[key.toLowerCase()] || COLUMN_TRANSLATIONS[key]);
};

/**
 * เพิ่มคำแปลใหม่ (สำหรับใช้ใน runtime หากจำเป็น)
 * Add new translation (for runtime use if needed)
 */
export const addTranslation = (key: string, translation: string): void => {
  COLUMN_TRANSLATIONS[key.toLowerCase()] = translation;
};

// Legacy export for backward compatibility
export const getMeasurementThaiName = getColumnThaiName;
