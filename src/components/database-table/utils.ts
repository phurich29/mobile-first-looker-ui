
/**
 * ฟังก์ชันจัดรูปแบบวันที่สำหรับตาราง
 * @param dateString วันที่เป็นสตริง
 * @param columnKey ชื่อคอลัมน์
 * @returns วันที่ที่จัดรูปแบบแล้ว
 */
export const formatDate = (dateString: string | null, columnKey?: string): string => {
  if (!dateString) return "-";
  
  try {
    // เพื่อความสม่ำเสมอ ให้แสดง thai_datetime ตามที่มีในฐานข้อมูลโดยตรง
    if (columnKey === 'thai_datetime' || dateString.includes('T')) {
      // แยกส่วนวันที่และเวลาจาก thai_datetime
      const [datePart, timePart] = dateString.split('T');
      // ตัดส่วน timezone ออกจากเวลา (ถ้ามี)
      const timeOnly = timePart ? timePart.split('+')[0] : '';
      
      return `${datePart} ${timeOnly}`;
    }
    
    // สำหรับคอลัมน์อื่นๆ ยังคงใช้การแปลงวันที่แบบเดิม
    return new Date(dateString).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (e) {
    return dateString;
  }
};

/**
 * ดึงคีย์คอลัมน์จากข้อมูลแถวแรก
 * @param data ข้อมูลตาราง
 * @returns รายการคีย์คอลัมน์
 */
export const getColumnKeys = (data: any[]): string[] => {
  // Default columns if no data
  if (!data || data.length === 0) return ['thai_datetime', 'device_code'];
  
  const firstItem = data[0];
  
  // Get filtered columns - exclude specific columns
  const filteredColumns = Object.keys(firstItem).filter(key => 
    !key.startsWith('_') && 
    key !== 'sample_index' && 
    key !== 'output' &&
    key !== 'id' &&
    key !== 'created_at'
  );
  
  // Create a prioritized array with thai_datetime first
  let orderedColumns = [];
  
  // Add thai_datetime first if it exists
  if (filteredColumns.includes('thai_datetime')) {
    orderedColumns.push('thai_datetime');
    // Remove from filtered columns to avoid duplication
    filteredColumns.splice(filteredColumns.indexOf('thai_datetime'), 1);
  }
  
  // Add the rest
  return [...orderedColumns, ...filteredColumns];
};
