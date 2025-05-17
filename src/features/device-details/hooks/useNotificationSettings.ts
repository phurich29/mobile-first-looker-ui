
import { useCallback } from "react";
import { NotificationSetting, getNotificationSetting } from "../types";

export const useNotificationSettings = (notificationSettings: NotificationSetting[]) => {
  // Function to get notification settings for a measurement
  const getNotificationSettingForSymbol: getNotificationSetting = useCallback((symbol: string) => {
    const setting = notificationSettings.find(s => s.rice_type_id === symbol);
    if (!setting) return null;
    
    // Determine notification type
    let type: 'min' | 'max' | 'both' = 'both';
    if (setting.min_enabled && !setting.max_enabled) type = 'min';
    else if (!setting.min_enabled && setting.max_enabled) type = 'max';
    
    // Format threshold
    let threshold = '';
    if (type === 'min') threshold = String(setting.min_threshold);
    else if (type === 'max') threshold = String(setting.max_threshold);
    else threshold = `${setting.min_threshold} - ${setting.max_threshold}`;
    
    return {
      enabled: setting.enabled,
      type,
      threshold
    };
  }, [notificationSettings]);

  return { getNotificationSetting: getNotificationSettingForSymbol };
};
