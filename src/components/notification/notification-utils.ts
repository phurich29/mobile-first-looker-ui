
import { format } from "date-fns";

// Helper function to get background color based on notification type
export const getNotificationBgColor = (type: 'min' | 'max' | 'both'): string => {
  if (type === 'min') return 'bg-blue-50';
  if (type === 'max') return 'bg-orange-50';
  return 'bg-purple-50'; // both
};

// Helper function to get icon color based on notification type
export const getNotificationIconColor = (type: 'min' | 'max' | 'both'): string => {
  if (type === 'min') return '#3b82f6'; // blue
  if (type === 'max') return '#f97316'; // orange
  return '#8b5cf6'; // purple
};

// Helper function to get appropriate icon name based on symbol and type
export const getNotificationIconName = (symbol: string, name: string, type: 'min' | 'max' | 'both', enabled: boolean): string => {
  if (!enabled) {
    return "bell-off";
  }
  
  // Match rice type symbols
  if (symbol === 'class1' || name.includes('ชั้น1')) {
    return "wheat";
  }
  
  if (symbol === 'class2' || name.includes('ชั้น2')) {
    return "wheat";
  }
  
  if (symbol === 'class3' || name.includes('ชั้น3')) {
    return "wheat";
  }
  
  // For threshold notifications
  if (type === 'min') {
    return "arrow-down";
  }
  
  if (type === 'max') {
    return "arrow-up";
  }
  
  return "gauge-circle"; // both
};

// Format time function to convert timestamp to HH:MM format with Thailand timezone
export const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  
  // Add 7 hours for Thailand timezone
  const thailandTime = new Date(date.getTime() + (7 * 60 * 60 * 1000));
  
  // Format as HH:MM
  const hours = thailandTime.getHours().toString().padStart(2, '0');
  const minutes = thailandTime.getMinutes().toString().padStart(2, '0');
  
  return `${hours}:${minutes}`;
};

// Format Bangkok time for dates
export const formatBankgokTime = (date?: Date): { thaiDate: string; thaiTime: string } => {
  if (!date) return { thaiDate: "ไม่มีข้อมูล", thaiTime: "ไม่มีข้อมูล" };
  
  // Add 7 hours for Thailand timezone
  const adjustedDate = new Date(date);
  adjustedDate.setHours(adjustedDate.getHours() + 7);
  
  // Split date and time into separate formats
  const dateOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  };
  
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };
  
  const thaiDate = new Intl.DateTimeFormat('th-TH', dateOptions).format(adjustedDate);
  const thaiTime = new Intl.DateTimeFormat('th-TH', timeOptions).format(adjustedDate);
  
  return { thaiDate, thaiTime };
};

// Get rule name based on notification type and status
export const getRuleName = (enabled: boolean, type: 'min' | 'max' | 'both'): string => {
  if (!enabled) return "ปิดแจ้งเตือน";
  
  if (type === 'min') {
    return "น้อยกว่า";
  }
  
  if (type === 'max') {
    return "มากกว่า";
  }
  
  return "นอกช่วง";
};

// Format threshold value
export const getThresholdValue = (enabled: boolean, threshold: string, type: 'min' | 'max' | 'both'): string => {
  if (!enabled) return "";
  
  if (type === 'min' || type === 'max') {
    return `${threshold}%`;
  }
  
  return threshold;
};
