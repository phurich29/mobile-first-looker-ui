
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
  // ตารางที่ 1: การจำแนกเมล็ดข้าวทั้งเมล็ด (Whole kernel classification)
  'class 1(>7.0...)': 'ชั้น 1(>7.0mm)',
  'class 2(>6.6-...)': 'ชั้น 2(>6.6-7...)',
  'class 3(>6.2-...)': 'ชั้น 3(>6.2-6...)',
  'short(≤6.2mm)': 'เมล็ดสั้น(≤6.2...)',
  'slender rice': 'ข้าวลีบ',

  // ตารางที่ 2: องค์ประกอบ (Composition)
  'whole kernels': 'เมล็ดเต็ม',
  'head rice': 'ต้นข้าว',
  'total brokens': 'ข้าวหักรวม',
  'small brokens': 'ปลายข้าว',
  'c1 brokens': 'ปลายข้าวC1',

  // ตารางที่ 3: คุณลักษณะและความบกพร่อง (Characteristics and Defects)
  'red line': 'เมล็ดแดง',
  'undercooked': 'ข้าวดิบ',
  'deviated color': 'เมล็ดม่วง',
  'slight deviated': 'ม่วงอ่อน',
  'yellow': 'เมล็ดเหลือง',
  'black kernels': 'เมล็ดดำ',
  'partly black & peck': 'ดำบางส่วน & จุดดำ',
  'partly black': 'ดำบางส่วน',
  'damaged': 'เมล็ดเสีย',
  'glutinous rice': 'ข้าวเหนียว',
  'impurity': 'เมล็ดอื่นๆ',
  'paddy(grain/kg)': 'ข้าวเปลือก(เมล็ด/กก.)',
  'whiteness': 'ความขาว',
  'mill degree': 'ระดับขัดสี',

  // ข้อมูลทั่วไป / General Information (Preserved - not part of the 3 tables above)
  'thai_datetime': 'วันที่-เวลา',
  'device_code': 'รหัสเครื่อง',
  'created_at': 'วันที่สร้าง',
  'updated_at': 'วันที่อัปเดต',

  // Legacy mappings for backward compatibility (Preserved)
  '70mm': 'ชั้น 1 (>7.0mm)',
  'shortgrain': 'เมล็ดสั้น',
  'slenderkernel': 'เมล็ดยาว',
  'wholekernels': 'เมล็ดเต็ม',
  'headrice': 'ข้าวหัว',
  'totalbrokens': 'ข้าวหักรวม',
  'smallbrokens': 'ข้าวหักเล็ก',
  'smallbrokesc1': 'ข้าวหักเล็ก C1',
  'redlinerate': 'เส้นแดง',
  'parboiledredline': 'ข้าวสุกเส้นแดง',
  'parboiledwhiterice': 'ข้าวสุกขาว',
  'honeyrice': 'ข้าวน้ำผึ้ง',
  'yellowricerate': 'ข้าวเหลือง',
  'blackkernel': 'เมล็ดดำ',
  'partlyblackpeck': 'จุดดำบางส่วน',
  'partlyblack': 'ดำบางส่วน',
  'imperfectionrate': 'ข้าวด้วย',
  'stickyricerate': 'ข้าวเหนียว',
  'impuritynum': 'สิ่งปนเปื้อน',
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
