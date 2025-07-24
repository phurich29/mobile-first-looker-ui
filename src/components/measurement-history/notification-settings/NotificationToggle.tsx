
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "@/hooks/useTranslation";

interface NotificationToggleProps {
  enabled: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export const NotificationToggle = ({ 
  enabled = false, 
  onChange, 
  disabled = false 
}: NotificationToggleProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label htmlFor="notification-enabled">{t('general', 'enableNotifications')}</Label>
        <p className="text-sm text-muted-foreground">
          {t('general', 'enableNotificationsDescription')}
        </p>
      </div>
      <Switch
        id="notification-enabled"
        checked={enabled}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </div>
  );
};

export default NotificationToggle;
