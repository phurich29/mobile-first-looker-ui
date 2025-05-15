
export interface NotificationSettingsProps {
  deviceCode: string;
  symbol: string;
  name: string;
  enabled: boolean;
  minEnabled: boolean;
  maxEnabled: boolean;
  minThreshold: number;
  maxThreshold: number;
}

export interface NotificationSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deviceCode: string;
  symbol: string;
  name: string;
}

export interface NotificationSettingsState {
  enabled: boolean;
  minEnabled: boolean;
  maxEnabled: boolean;
  minThreshold: number;
  maxThreshold: number;
}
