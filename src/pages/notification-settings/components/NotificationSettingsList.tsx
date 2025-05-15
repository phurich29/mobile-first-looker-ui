
import { NotificationSetting } from "../types";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./EmptyState";
import { NotificationSettingCard } from "./NotificationSettingCard";

interface NotificationSettingsListProps {
  settings: NotificationSetting[];
  loading: boolean;
  error: string | null;
}

export const NotificationSettingsList = ({ 
  settings, 
  loading, 
  error 
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
    <div className="space-y-4">
      {settings.map((setting) => (
        <NotificationSettingCard key={setting.id} setting={setting} />
      ))}
    </div>
  );
};
