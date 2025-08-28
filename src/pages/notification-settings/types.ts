
// ✅ Unified notification setting interface - ใช้เป็น single source of truth
export interface NotificationSetting {
  id?: string;
  device_code: string;
  rice_type_id: string;
  rice_type_name: string;
  enabled: boolean;
  min_enabled: boolean;
  max_enabled: boolean;
  min_threshold: number;
  max_threshold: number;
  user_id: string; // เพิ่ม user_id เป็น required field
  device_name?: string;
  created_at?: string;
  updated_at?: string;
}
