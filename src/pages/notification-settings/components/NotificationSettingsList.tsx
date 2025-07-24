
import { NotificationSetting } from "../types";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./EmptyState";
import { NotificationSettingCard } from "./NotificationSettingCard";
import { useTranslation } from "@/hooks/useTranslation";

interface NotificationSettingsListProps {
  settings: NotificationSetting[];
  loading: boolean;
  error: string | null;
  onEditSetting?: (deviceCode: string, riceTypeId: string, riceName: string) => void;
}

export const NotificationSettingsList = ({ 
  settings, 
  loading, 
  error,
  onEditSetting
}: NotificationSettingsListProps) => {
  const { t } = useTranslation();
  
  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (settings.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-3">
      <div className="mb-3 text-sm text-gray-700 dark:text-gray-300 flex justify-between font-medium">
        <span>{t('mainMenu', 'allNotifications')} ({settings.length} {t('mainMenu', 'items')})</span>
        <span>{t('mainMenu', 'status')}</span>
      </div>
      {settings.map((setting) => (
        <NotificationSettingCard 
          key={setting.id} 
          setting={setting} 
          onEdit={onEditSetting}
        />
      ))}
    </div>
  );
};
