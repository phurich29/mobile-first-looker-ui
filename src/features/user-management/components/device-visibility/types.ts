export interface HiddenDevice {
  id: string;
  device_code: string;
  hidden_for_admin: boolean;
  created_at: string;
}

export interface DeviceVisibilityManagementProps {
  isAdmin: boolean;
  isSuperAdmin: boolean;
}