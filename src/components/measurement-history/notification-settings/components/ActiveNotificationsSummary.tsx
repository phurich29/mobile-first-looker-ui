
import { CheckCircle2 } from "lucide-react";
import { NotificationSettingsState } from "../types";
import { useTranslation } from "@/hooks/useTranslation";

interface ActiveNotificationsSummaryProps {
  settings: NotificationSettingsState;
}

export const ActiveNotificationsSummary = ({ settings }: ActiveNotificationsSummaryProps) => {
  const { t } = useTranslation();
  
  // Summary of active notifications
  const getActiveNotificationsText = () => {
    if (!settings.enabled) return t('general', 'notificationsDisabled');
    
    const activeNotifications = [];
    if (settings.minEnabled) activeNotifications.push(`${t('general', 'lowerThan')} ${settings.minThreshold}`);
    if (settings.maxEnabled) activeNotifications.push(`${t('general', 'higherThan')} ${settings.maxThreshold}`);
    
    if (activeNotifications.length === 0) return t('general', 'enabledButNoThreshold');
    return `${t('general', 'notifyWhen')} ${activeNotifications.join(` ${t('general', 'or')} `)}`;
  };

  return (
    <div className="bg-emerald-50 p-3 rounded-md">
      <div className="flex items-start gap-2">
        <CheckCircle2 className={`h-5 w-5 mt-0.5 ${settings.enabled ? 'text-emerald-600' : 'text-gray-400'}`} />
        <div>
          <p className="font-medium">{t('general', 'notificationStatus')}</p>
          <p className="text-sm text-gray-700">{getActiveNotificationsText()}</p>
        </div>
      </div>
    </div>
  );
};

export default ActiveNotificationsSummary;
