
import React from "react";
import { formatTime, getRuleName, getThresholdValue } from "./notification-utils";
import { Bot } from "lucide-react";

interface NotificationValueProps {
  latestValue: number | null;
  latestTimestamp: string | null;
  enabled: boolean;
  threshold: string;
  type: 'min' | 'max' | 'both';
  isAlertActive: boolean;
}

const NotificationValue: React.FC<NotificationValueProps> = ({
  latestValue,
  latestTimestamp,
  enabled,
  threshold,
  type,
  isAlertActive
}) => {
  return (
    <div className={`px-3 py-1.5 rounded-lg flex flex-col items-end justify-center min-h-[54px] min-w-[100px] space-y-0.5 ${isAlertActive ? 'bg-red-50/90 animate-pulse' : 'bg-gray-50/80'}`}>
      {/* Current value with timestamp */}
      <div className="relative">
        {latestValue !== null && latestTimestamp && (
          <p className={`font-medium text-xs ${isAlertActive ? 'text-red-600 font-bold' : 'text-green-600'} leading-tight`}>
            {formatTime(latestTimestamp)} {latestValue.toFixed(1)}%
            {/* Bot icon positioned near the timestamp */}
            {enabled && (
              <span className="absolute -top-2 -left-4">
                <Bot size={14} className="text-orange-500" />
              </span>
            )}
          </p>
        )}
      </div>
      
      {/* Rule name */}
      <p className={`font-medium text-xs ${enabled ? (isAlertActive ? 'text-red-500' : 'text-green-600') : 'text-gray-500'} leading-tight`}>
        {getRuleName(enabled, type)}
      </p>
      
      {/* Threshold value */}
      <p className={`font-medium text-xs ${enabled ? (isAlertActive ? 'text-red-600 font-bold' : 'text-green-600 font-bold') : 'text-gray-500'} leading-tight`}>
        {getThresholdValue(enabled, threshold, type)}
      </p>
    </div>
  );
};

export default NotificationValue;
