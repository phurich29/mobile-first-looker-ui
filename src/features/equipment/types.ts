
export interface DeviceInfo {
  device_code: string;
  updated_at: string | null;
  display_name?: string;
}

export interface User {
  id: string;
  email: string;
  hasAccess: boolean;
}
