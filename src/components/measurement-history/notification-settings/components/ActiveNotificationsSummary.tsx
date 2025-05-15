
import { CheckCircle2 } from "lucide-react";
import { NotificationSettingsState } from "../types";

interface ActiveNotificationsSummaryProps {
  settings: NotificationSettingsState;
}

export const ActiveNotificationsSummary = ({ settings }: ActiveNotificationsSummaryProps) => {
  // Summary of active notifications
  const getActiveNotificationsText = () => {
    if (!settings.enabled) return "การแจ้งเตือนปิดอยู่";
    
    const activeNotifications = [];
    if (settings.minEnabled) activeNotifications.push(`ต่ำกว่า ${settings.minThreshold}`);
    if (settings.maxEnabled) activeNotifications.push(`สูงกว่า ${settings.maxThreshold}`);
    
    if (activeNotifications.length === 0) return "เปิดใช้งานแล้วแต่ยังไม่ได้กำหนดเกณฑ์";
    return `แจ้งเตือนเมื่อ: ${activeNotifications.join(' หรือ ')}`;
  };

  return (
    <div className="bg-emerald-50 p-3 rounded-md">
      <div className="flex items-start gap-2">
        <CheckCircle2 className={`h-5 w-5 mt-0.5 ${settings.enabled ? 'text-emerald-600' : 'text-gray-400'}`} />
        <div>
          <p className="font-medium">สถานะการแจ้งเตือน</p>
          <p className="text-sm text-gray-700">{getActiveNotificationsText()}</p>
        </div>
      </div>
    </div>
  );
};

export default ActiveNotificationsSummary;
