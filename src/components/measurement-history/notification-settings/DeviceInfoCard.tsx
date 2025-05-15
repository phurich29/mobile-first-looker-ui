
import { Bell, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";

interface DeviceInfoCardProps {
  deviceCode: string;
}

export const DeviceInfoCard = ({ deviceCode }: DeviceInfoCardProps) => {
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-md">
      <div className="flex items-center gap-2">
        <Smartphone className="h-5 w-5 text-gray-500" />
        <div>
          <p className="text-sm font-medium">รหัสอุปกรณ์</p>
          <p className="text-sm text-gray-500">{deviceCode}</p>
        </div>
      </div>
      
      <Link 
        to="/notifications" 
        className="flex items-center gap-1 text-xs px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md hover:bg-emerald-100 transition-colors"
      >
        <Bell className="h-3 w-3" />
        <span>ดูการแจ้งเตือน</span>
      </Link>
    </div>
  );
};

export default DeviceInfoCard;
