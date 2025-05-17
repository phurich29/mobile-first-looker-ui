
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
      {latestValue !== null && latestTimestamp && (
        <p className={`font-medium text-xs ${isAlertActive ? 'text-red-600 font-bold' : 'text-green-600'} leading-tight`}>
          {formatTime(latestTimestamp)} {latestValue.toFixed(1)}%
        </p>
      )}
      
      {/* Rule name */}
      <p className={`font-medium text-xs ${enabled ? (isAlertActive ? 'text-red-500' : 'text-green-600') : 'text-gray-500'} leading-tight`}>
        {getRuleName(enabled, type)}
      </p>
      
      {/* Threshold value with bot icon on the right */}
      <div className="flex items-center justify-end w-full">
        <p className={`font-medium text-xs ${enabled ? (isAlertActive ? 'text-red-600 font-bold' : 'text-green-600 font-bold') : 'text-gray-500'} leading-tight`}>
          {getThresholdValue(enabled, threshold, type)}
        </p>
        {enabled && (
          <Bot className="ml-1 h-3 w-3 text-gray-500" />
        )}
      </div>
    </div>
  );
};

export default NotificationValue;
