
import { format } from "date-fns";
import { th } from "date-fns/locale";

export const formatEquipmentTime = (lastUpdated: string | null) => {
  if (!lastUpdated || lastUpdated === "-") return "ไม่มีข้อมูล";
  
  const date = new Date(lastUpdated);
  // เพิ่มเวลาอีก 7 ชั่วโมง
  date.setHours(date.getHours() + 7);
  return format(date, "dd MMM yy HH:mm น.", { locale: th });
};

export const isRecentUpdate = (lastUpdated: string | null, deviceData?: any): boolean => {
  if (!lastUpdated || lastUpdated === "-") return false;
  
  // ตรวจสอบค่า "-" ในคอลัมน์อื่นๆ ของข้อมูลอุปกรณ์
  if (deviceData) {
    // ตรวจสอบคอลัมน์ที่สำคัญในข้อมูลการวิเคราะห์คุณภาพข้าว
    const importantFields = [
      'class1', 'class2', 'class3', 'whole_kernels', 'head_rice', 
      'total_brokens', 'small_brokens', 'whiteness', 'process_precision'
    ];
    
    // ถ้าพบค่า "-" ในฟิลด์ใดฟิลด์หนึ่ง ให้ถือว่าไม่ใช่การอัพเดทที่สมบูรณ์
    for (const field of importantFields) {
      if (deviceData[field] === "-" || deviceData[field] === null || deviceData[field] === undefined) {
        return false;
      }
    }
  }
  
  try {
    // สร้าง Date object จาก lastUpdated และปรับเขตเวลา +7 ชั่วโมง
    const adjustedLastUpdateDate = new Date(lastUpdated);
    adjustedLastUpdateDate.setHours(adjustedLastUpdateDate.getHours() + 7);
    
    if (isNaN(adjustedLastUpdateDate.getTime())) {
      console.warn("Invalid adjustedLastUpdateDate date string:", lastUpdated);
      return false;
    }
    
    const now = new Date(); // เวลาปัจจุบัน (ควรจะเป็น GMT+7 หากเครื่องผู้ใช้ตั้งค่าถูกต้อง)
    // คำนวณ 30 นาทีในหน่วยมิลลิวินาที
    const thirtyMinutesInMs = 30 * 60 * 1000;
    // คำนวณส่วนต่างเวลาระหว่างเวลาปัจจุบันกับเวลาที่ปรับเขตเวลาแล้ว
    const diffMs = now.getTime() - adjustedLastUpdateDate.getTime();
    // ตรวจสอบว่าส่วนต่างเวลาอยู่ในช่วง 30 นาทีล่าสุดหรือไม่
    return diffMs >= 0 && diffMs < thirtyMinutesInMs;
  } catch (error) {
    console.error("Error processing adjustedLastUpdateDate:", lastUpdated, error);
    return false;
  }
};

export const getTimeClasses = (isRecent: boolean): string => {
  return isRecent
    ? "font-bold text-green-700 bg-yellow-200 dark:text-green-300 dark:bg-yellow-600/40 px-1.5 py-0.5 rounded-md"
    : "font-medium text-gray-800 dark:text-teal-200";
};
