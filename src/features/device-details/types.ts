
// Re-export from central types
export type { NotificationSetting } from "@/pages/notification-settings/types";

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
