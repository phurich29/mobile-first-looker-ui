
import { NotificationSetting } from "../types";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./EmptyState";
import { NotificationSettingCard } from "./NotificationSettingCard";

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
    <div className="space-y-3 max-w-xl mx-auto">
      <div className="mb-3 text-sm text-gray-700 dark:text-gray-300 flex justify-between font-medium">
        <span>การแจ้งเตือนที่กำหนดไว้</span>
        <span>สถานะ</span>
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
