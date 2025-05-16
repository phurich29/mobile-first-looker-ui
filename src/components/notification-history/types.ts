
export interface Notification {
  id: string;
  device_code: string;
  rice_type_id: string;
  threshold_type: string;
  value: number;
  notification_message: string;
  notification_count: number;
  timestamp: string;
  read: boolean;
  analysis_id?: number;
}
