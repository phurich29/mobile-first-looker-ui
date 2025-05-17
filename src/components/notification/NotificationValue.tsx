
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
    <div className={`px-3 py-1.5 rounded-lg flex flex-col items-end justify-center min-h-[54px] min-w-[100px] space-y-0.5 ${isAlertActive ? 'bg-red-50/90' : 'bg-gray-50/80'}`}>
      {/* Current value with timestamp */}
      {latestValue !== null && latestTimestamp && (
        <p className={`font-medium ${isAlertActive ? 'text-red-600 font-bold value-blink' : 'text-green-600'} leading-tight`}>
          {formatTime(latestTimestamp)} {latestValue.toFixed(1)}%
        </p>
      )}
      
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
