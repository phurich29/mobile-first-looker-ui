
export interface NotificationSetting {
  rice_type_id: string;
  rice_type_name: string;
  min_threshold: number;
  max_threshold: number;
  enabled: boolean;
  min_enabled: boolean;
  max_enabled: boolean;
}

export type MeasurementItem = {
  symbol: string;
  name: string;
  price?: string;
  percentageChange?: number;
  iconColor: string;
  updatedAt: Date;
  deviceName?: string;
  notificationType?: 'min' | 'max' | 'both';
  threshold?: string;
  enabled?: boolean;
};

export type getNotificationSetting = (symbol: string) => {
  enabled: boolean;
  type: 'min' | 'max' | 'both';
  threshold: string;
} | null;
