
export interface DeviceInfo {
  device_code: string;
  updated_at: string | null;
}

export interface User {
  id: string;
  email: string;
  hasAccess: boolean;
}
