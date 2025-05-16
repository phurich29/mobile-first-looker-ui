
export interface Notification {
  id: string;
  rice_type_id: string;
  device_code: string;
  threshold_type: string;
  value: number;
  notification_message: string;
  timestamp: string;
  created_at?: string;
  notification_count: number;
  read?: boolean;
  analysis_id?: number;
  user_id?: string;
}
