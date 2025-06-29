
export interface User {
  id: string;
  email: string;
  hasAccess: boolean;
  role?: string;
  hasImplicitAccess?: boolean;
}

export interface Device {
  deviceCode: string;
  lastUpdated: string | null;
  displayName?: string;
  deviceData?: any; // เพิ่มฟิลด์สำหรับข้อมูลอุปกรณ์
}

export interface DeviceInfo {
  device_code: string;
  display_name?: string;
  updated_at: string;
  deviceData?: any; // เพิ่มฟิลด์สำหรับข้อมูลอุปกรณ์
}

export interface DeviceData {
  devices: Device[];
  isLoading: boolean;
  isRefreshing: boolean;
  totalUniqueDevices: number;
  handleRefresh: () => void;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}
