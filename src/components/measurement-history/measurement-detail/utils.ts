
import { MeasurementDetail, GroupedData } from "./types";

// Helper function to group measurement fields
export const groupFields = (data: MeasurementDetail | null): GroupedData => {
  if (!data) return {};
  
  const groups: GroupedData = {
    "ข้อมูลทั่วไป": [],
    "ข้าวเต็มเมล็ด": [],
    "องค์ประกอบ": [],
    "สิ่งเจือปน": [],
    "อื่นๆ": [],
  };
  
  // Map specific prefixes to groups
  const prefixToGroup: Record<string, string> = {
    "wg_": "ข้าวเต็มเมล็ด",
    "ing_": "องค์ประกอบ", 
    "imp_": "สิ่งเจือปน",
  };
  
  // Process each field
  Object.entries(data).forEach(([key, value]) => {
    // Skip internal fields and empty values
    if (key.startsWith("_") || value === null || value === undefined) return;
    
    // Add basic fields to general info
    if (["device_code", "thai_datetime", "created_at"].includes(key)) {
      groups["ข้อมูลทั่วไป"].push({ key, value });
      return;
    }
    
    // Check for known prefixes
    let assigned = false;
    for (const [prefix, group] of Object.entries(prefixToGroup)) {
      if (key.startsWith(prefix)) {
        groups[group].push({ key, value });
        assigned = true;
        break;
      }
    }
    
    // If not assigned to any group, add to "others"
    if (!assigned && !key.startsWith("_") && key !== "id" && key !== "sample_index" && key !== "output") {
      groups["อื่นๆ"].push({ key, value });
    }
  });
  
  // Filter out empty groups
  return Object.fromEntries(
    Object.entries(groups).filter(([_, items]) => items.length > 0)
  );
};

// Format field value based on type and key
export const formatValue = (key: string, value: any): string => {
  if (key.includes('date') || key.includes('_at')) {
    return formatDate(value, key);
  }
  
  if (typeof value === 'number') {
    return value.toFixed(2);
  }
  
  return value?.toString() || "-";
};

// Helper to format date from the original component
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

// Helper to get user-friendly field label
export const getFieldLabel = (key: string): string => {
  // Remove common prefixes
  let label = key
    .replace(/^wg_|^ing_|^imp_/, '')
    .replace(/_/g, ' ');
  
  // Capitalize first letter
  return label.charAt(0).toUpperCase() + label.slice(1);
};
