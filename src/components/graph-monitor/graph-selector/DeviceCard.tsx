
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

// Equipment icon as data URL
const equipmentIconDataUrl = "data:image/svg+xml,%3c?xml%20version=%271.0%27%20encoding=%27UTF-8%27?%3e%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20viewBox=%270%200%20800%20800%27%3e%3cg%3e%3c!--%20%E0%B8%90%E0%B8%B2%E0%B8%99%E0%B8%AD%E0%B8%B8%E0%B8%9B%E0%B8%81%E0%B8%A3%E0%B8%93%E0%B9%8C%20--%3e%3crect%20x=%270%27%20y=%27700%27%20width=%27800%27%20height=%27100%27%20fill=%27%23606c76%27/%3e%3c!--%20%E0%B8%82%E0%B8%B2%20--%3e%3crect%20x=%27100%27%20y=%27600%27%20width=%2780%27%20height=%27100%27%20fill=%27%23606c76%27/%3e%3crect%20x=%27620%27%20y=%27600%27%20width=%2780%27%20height=%27100%27%20fill=%27%23606c76%27/%3e%3c!--%20%E0%B8%95%E0%B8%B1%E0%B8%A7%E0%B9%80%E0%B8%84%E0%B8%A3%E0%B8%B7%E0%B9%88%E0%B8%AD%E0%B8%87%E0%B8%AB%E0%B8%A5%E0%B8%B1%E0%B8%81%20--%3e%3crect%20x=%2713%27%20y=%2713%27%20width=%27774%27%20height=%27587%27%20fill=%27%23606c76%27/%3e%3crect%20x=%2793%27%20y=%2793%27%20width=%27521%27%20height=%27427%27%20fill=%27%23d1d3cd%27/%3e%3c!--%20%E0%B9%81%E0%B8%97%E0%B9%88%E0%B8%99%E0%B8%AA%E0%B9%81%E0%B8%81%E0%B8%99%20--%3e%3cpolygon%20points=%27213,180%20520,180%20400,300%20307,300%27%20fill=%27%23606c76%27/%3e%3crect%20x=%27260%27%20y=%27300%27%20width=%27120%27%20height=%2760%27%20fill=%27%239fa1a3%27/%3e%3c!--%20%E0%B9%80%E0%B8%84%E0%B8%A3%E0%B8%B7%E0%B9%88%E0%B8%AD%E0%B8%87%E0%B8%A1%E0%B8%B7%E0%B8%AD%E0%B8%94%E0%B9%89%E0%B8%B2%E0%B8%99%E0%B8%82%E0%B8%A7%E0%B8%B2%20--%3e%3crect%20x=%27573%27%20y=%2766%27%20width=%27160%27%20height=%27107%27%20fill=%27%23d1d3cd%27/%3e%3c!--%20%E0%B8%9B%E0%B8%B8%E0%B9%88%E0%B8%A1%E0%B8%81%E0%B8%94%20--%3e%3ccircle%20cx=%27573%27%20cy=%27234%27%20r=%2730%27%20fill=%27%23d1d3cd%27/%3e%3ccircle%20cx=%27640%27%20cy=%27234%27%20r=%2730%27%20fill=%27%23d1d3cd%27/%3e%3ccircle%20cx=%27707%27%20cy=%27234%27%20r=%2730%27%20fill=%27%23d1d3cd%27/%3e%3ccircle%20cx=%27774%27%20cy=%27234%27%20r=%2730%27%20fill=%27%23d1d3cd%27/%3e%3c!--%20%E0%B8%9B%E0%B8%B8%E0%B9%88%E0%B8%A1%E0%B8%84%E0%B8%A7%E0%B8%9A%E0%B8%84%E0%B8%B8%E0%B8%A1%20--%3e%3crect%20x=%27600%27%20y=%27334%27%20width=%2760%27%20height=%2760%27%20fill=%27%23d1d3cd%27/%3e%3crect%20x=%27700%27%20y=%27334%27%20width=%2760%27%20height=%2760%27%20fill=%27%23d1d3cd%27/%3e%3c!--%20%E0%B8%9B%E0%B8%B8%E0%B9%88%E0%B8%A1%E0%B8%A5%E0%B9%88%E0%B8%B2%E0%B8%87%20--%3e%3ccircle%20cx=%27133%27%20cy=%27520%27%20r=%2733%27%20fill=%27%23606c76%27/%3e%3ccircle%20cx=%27216%27%20cy=%27520%27%20r=%2733%27%20fill=%27%23606c76%27/%3e%3ccircle%20cx=%27299%27%20cy=%27520%27%20r=%2733%27%20fill=%27%23606c76%27/%3e%3ccircle%20cx=%27382%27%20cy=%27520%27%20r=%2733%27%20fill=%27%23606c76%27/%3e%3ccircle%20cx=%27465%27%20cy=%27520%27%20r=%2733%27%20fill=%27%23606c76%27/%3e%3ccircle%20cx=%27548%27%20cy=%27520%27%20r=%2733%27%20fill=%27%23606c76%27/%3e%3ccircle%20cx=%27631%27%20cy=%27520%27%20r=%2733%27%20fill=%27%23606c76%27/%3e%3c/g%3e%3c/svg%3e";

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
          ? "bg-purple-100 border border-purple-300 dark:bg-purple-900/30 dark:border-purple-700"
          : "bg-gray-50 hover:bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center mr-2 dark:bg-purple-900/30">
          <img 
            src={equipmentIconDataUrl}
            alt="Equipment" 
            className="h-4 w-4" 
          />
        </div>
        <div className="flex flex-col">
          <p className="font-medium text-gray-800 text-sm dark:text-gray-200">
            {device.device_name}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {device.device_code}
          </p>
        </div>
      </div>
      <div className="flex items-center text-xs mt-1">
        <Clock className="h-3 w-3 mr-1 text-gray-500 dark:text-gray-400" />
        <span className={isRecentUpdate(device.last_updated) ? "text-green-500" : "text-gray-500 dark:text-gray-400"}>
          อัปเดต: {formatLastUpdated(device.last_updated)}
        </span>
      </div>
    </div>
  );
};
