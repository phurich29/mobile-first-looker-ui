
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Settings, Clock, Circle, Bell, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { formatEquipmentTime, isRecentUpdate, getTimeClasses } from "./utils/timeUtils";
import { useTranslation } from "@/hooks/useTranslation";
import { useNotificationStatus } from "../../hooks/useNotificationStatus";

interface EquipmentCardContentProps {
  deviceCode: string;
  lastUpdated: string | null;
  isAdmin: boolean;
  onEditClick: () => void;
  deviceData?: any;
}

export function EquipmentCardContent({
  deviceCode,
  lastUpdated,
  isAdmin,
  onEditClick,
  deviceData
}: EquipmentCardContentProps) {
  const { t, language } = useTranslation();
  const { data: notificationStatus, isLoading, error } = useNotificationStatus(deviceCode);
  const formattedTime = formatEquipmentTime(lastUpdated, language);
  const isRecent = isRecentUpdate(lastUpdated, deviceData);
  const timeClasses = getTimeClasses(isRecent);

  // Debug logging for notification status
  console.log(`🔔 Device ${deviceCode} - notificationStatus:`, notificationStatus, 'isLoading:', isLoading, 'error:', error);

  const handleDeviceClick = () => {
    // Save last viewed device for both authenticated users and guests
    localStorage.setItem('lastViewedDeviceCode', deviceCode);
    console.log('💾 Saved last viewed device:', deviceCode);
  };

  // กำหนดสถานะและสีของไอคอนแจ้งเตือน
  const getNotificationIcon = () => {
    if (!notificationStatus?.hasSettings) return null;

    if (notificationStatus.isTriggered) {
      // กระดิ่งสีแดง - เข้าเงื่อนไขการแจ้งเตือน
      const triggeredCount = notificationStatus.triggeredSettings.length;
      return (
        <div 
          title={`เข้าเงื่อนไขการแจ้งเตือน ${triggeredCount} รายการ`}
          className="relative"
        >
          <AlertTriangle className="h-3.5 w-3.5 ml-1.5 text-red-500 fill-red-500" />
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </div>
      );
    } else {
      // กระดิ่งสีเหลือง - มีการตั้งค่าแต่ไม่เข้าเงื่อนไข
      return (
        <div title="มีการตั้งค่าแจ้งเตือนสำหรับเครื่องนี้">
          <Bell className="h-3.5 w-3.5 ml-1.5 text-amber-500" />
        </div>
      );
    }
  };

  return (
    <CardContent className="p-2 pt-1 sm:p-4 sm:pt-0">
      <div className="text-xs text-gray-600 dark:text-slate-400">
        <div className="flex items-center">
          <Clock className="h-3.5 w-3.5 mr-1.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          <div className="flex flex-col">
            <span className={timeClasses}>{formattedTime}</span>
          </div>
          {isRecent ? (
            <Circle className="h-4 w-4 ml-1.5 text-green-500 fill-green-500" />
          ) : (
            <Circle className="h-4 w-4 ml-1.5 text-red-500 fill-red-500" />
          )}
          {getNotificationIcon()}
        </div>
      </div>
      
      <div className="flex flex-row gap-2 mt-2 sm:mt-3">
        <Button
          variant="outline"
          className="flex-1 text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 h-8 px-2 rounded-md sm:h-9 sm:px-3"
          asChild
        >
          <Link
            to={`/device/${deviceCode}`}
            onClick={handleDeviceClick}
          >
            <BarChart className="h-3 w-3 mr-1" />
            {t('general', 'viewData')}
          </Link>
        </Button>
        
        {isAdmin && (
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 p-0 flex items-center justify-center rounded-md sm:h-9 sm:w-9 flex-shrink-0 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            onClick={onEditClick}
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </CardContent>
  );
}
