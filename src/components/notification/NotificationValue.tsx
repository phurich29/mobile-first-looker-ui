
import React from "react";
import { formatTime, getRuleName, getThresholdValue } from "./notification-utils";
import "../notification-item-animation.css";

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
    <div className={`px-3 py-1.5 rounded-lg flex flex-col items-end justify-center min-h-[54px] min-w-[100px] space-y-0.5 ${isAlertActive ? 'bg-red-50/90 dark:bg-red-900/50' : 'bg-gray-50/80 dark:bg-gray-700/80'}`}>
      {/* Current value with timestamp */}
      {latestValue !== null && latestTimestamp && (
        <>
          <p className="font-medium text-xs text-gray-500 dark:text-gray-400 leading-tight">
            {formatTime(latestTimestamp)}
          </p>
          <div className="flex items-center space-x-1">
            {/* Notification type text on the left of percentage */}
            {enabled && (
              <div className="text-[10px] text-orange-600 dark:text-orange-400 font-medium">
                {type === 'min' ? `เตือนเมื่อต่ำกว่า ${threshold}` : 
                 type === 'max' ? `เตือนเมื่อสูงกว่า ${threshold}` : 
                 `เตือนเมื่อนอกช่วง ${threshold}`}
              </div>
            )}
            <p className={`font-medium text-sm ${isAlertActive ? 'text-red-600 dark:text-red-400 font-bold value-blink' : 'text-green-600 dark:text-green-400'} leading-tight`}>
              {latestValue.toFixed(1)}%
            </p>
          </div>
        </>
      )}
      
      {/* Rule name and Threshold value - only show if notification is NOT enabled */}
      {!enabled && (
        <>
          {/* Rule name */}
          <p className={`font-medium text-xs ${enabled ? (isAlertActive ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400') : 'text-gray-500 dark:text-gray-400'} leading-tight`}>
            {getRuleName(enabled, type)}
          </p>
          
          {/* Threshold value */}
          <p className={`font-medium text-xs ${enabled ? (isAlertActive ? 'text-red-600 dark:text-red-400 font-bold' : 'text-green-600 dark:text-green-400 font-bold') : 'text-gray-500 dark:text-gray-400'} leading-tight`}>
            {getThresholdValue(enabled, threshold, type)}
          </p>
        </>
      )}
    </div>
  );
};

export default NotificationValue;
