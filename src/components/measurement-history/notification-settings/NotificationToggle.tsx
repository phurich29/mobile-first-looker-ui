
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

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
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label htmlFor="notification-enabled">เปิดใช้งานการแจ้งเตือน</Label>
        <p className="text-sm text-muted-foreground">
          เปิดใช้งานการแจ้งเตือนสำหรับค่าวัดนี้
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
