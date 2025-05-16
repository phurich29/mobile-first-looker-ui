
import React from "react";
import { Clock } from "lucide-react";
import { formatDistanceToNow, format, differenceInHours } from "date-fns";
import { th } from "date-fns/locale";

interface DeviceInfo {
  device_code: string;
  device_name: string;
  last_updated?: Date | null;
}

interface DeviceCardProps {
  device: DeviceInfo;
  isSelected: boolean;
  onClick: () => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({ 
  device, 
  isSelected, 
  onClick 
}) => {
  // Format the last updated time
  const formatLastUpdated = (date: Date | null | undefined) => {
    if (!date) return "ไม่มีข้อมูล";
    
    const timeDistance = formatDistanceToNow(date, { addSuffix: true, locale: th });
    const exactTime = format(date, "HH:mm น.", { locale: th });
    
    return `${timeDistance} (${exactTime})`;
  };

  // Check if the last update was within 24 hours
  const isRecentUpdate = (date: Date | null | undefined) => {
    if (!date) return false;
    return differenceInHours(new Date(), date) < 24;
  };

  return (
    <div
      className={`p-3 rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? "bg-purple-100 border border-purple-300"
          : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center mr-2">
          <img 
            src="/src/assets/equipment-icon.svg" 
            alt="Equipment" 
            className="h-4 w-4 text-purple-600" 
          />
        </div>
        <p className="font-medium text-gray-800 text-sm">{device.device_name}</p>
      </div>
      <div className="flex items-center text-xs mt-1">
        <Clock className="h-3 w-3 mr-1" />
        <span className={isRecentUpdate(device.last_updated) ? "text-green-500" : "text-gray-500"}>
          อัปเดต: {formatLastUpdated(device.last_updated)}
        </span>
      </div>
    </div>
  );
};
