
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import { Pin } from "lucide-react";

interface DeviceInfo {
  device_code: string;
  device_name: string;
  last_updated?: Date | null;
}

interface DeviceCardProps {
  device: DeviceInfo;
  isSelected: boolean;
  isFocused?: boolean;
  onClick: () => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({ device, isSelected, isFocused, onClick }) => {
  const formattedTime = device.last_updated
    ? formatDistanceToNow(device.last_updated, {
        addSuffix: true,
        locale: th,
      })
    : "ไม่มีข้อมูล";

  return (
    <div 
      className={`
        flex flex-col p-3 rounded-lg border cursor-pointer transition-all
        ${isSelected 
          ? "bg-blue-50 border-blue-300" 
          : "bg-white hover:bg-gray-50 border-gray-200"}
        ${isFocused ? "border-l-4 border-l-blue-500" : ""}
      `}
      onClick={onClick}
    >
      <div className="flex items-center mb-1">
        <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center mr-2">
          <span className="text-lg font-bold text-gray-500">
            {device.device_name.charAt(0)}
          </span>
        </div>
        <div className="flex-grow">
          <p className="font-medium text-sm line-clamp-1">
            {device.device_name}
            {isFocused && (
              <Pin className="inline-block h-3 w-3 ml-1 text-blue-500" />
            )}
          </p>
          <p className="text-xs text-gray-500 line-clamp-1">
            {device.device_code}
          </p>
        </div>
      </div>
      <div className="text-xs text-gray-400 mt-1 pl-10">
        {formattedTime}
      </div>
    </div>
  );
};
