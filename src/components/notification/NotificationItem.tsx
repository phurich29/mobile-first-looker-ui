
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLatestMeasurement } from "../measurement-history/api";
import { getNotificationBgColor } from "./notification-utils";
import NotificationIcon from "./NotificationIcon";
import NotificationValue from "./NotificationValue";
import NotificationAlert from "./NotificationAlert";
import "../notification-item-animation.css";

export type NotificationItemProps = {
  symbol: string;
  name: string;
  deviceCode: string;
  deviceName: string;
  threshold: string;
  enabled: boolean;
  type: 'min' | 'max' | 'both';
  createdAt?: Date;
  updatedAt?: Date;
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  symbol,
  name,
  deviceCode,
  deviceName,
  threshold,
  enabled,
  type,
  createdAt,
  updatedAt,
}) => {
  const navigate = useNavigate();
  
  const [latestValue, setLatestValue] = useState<number | null>(null);
  const [latestTimestamp, setLatestTimestamp] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAlertActive, setIsAlertActive] = useState(false);
  
  // Fetch latest measurement data
  useEffect(() => {
    const fetchLatestValue = async () => {
      if (!deviceCode || !symbol) return;
      
      setIsLoading(true);
      try {
        const result = await getLatestMeasurement(deviceCode, symbol);
        setLatestValue(result.value);
        setLatestTimestamp(result.timestamp);
        
        // Check if alert conditions are met
        if (result.value !== null && enabled) {
          const thresholdValue = parseFloat(threshold);
          if (
            (type === 'min' && result.value < thresholdValue) ||
            (type === 'max' && result.value > thresholdValue) ||
            (type === 'both' && (
              result.value < thresholdValue || 
              result.value > thresholdValue
            ))
          ) {
            setIsAlertActive(true);
          } else {
            setIsAlertActive(false);
          }
        }
      } catch (error) {
        console.error("Error fetching latest value:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLatestValue();
    
    // Update values every 30 seconds
    const intervalId = setInterval(fetchLatestValue, 30000);
    return () => clearInterval(intervalId);
  }, [deviceCode, symbol, threshold, type, enabled]);

  // Handle navigation to measurement history
  const handleClick = () => {
    navigate(`/measurement-history/${deviceCode}/${symbol}?name=${encodeURIComponent(name)}`);
  };

  return (
    <div 
      onClick={handleClick}
      className={`flex items-center justify-between py-3 px-3 border-b border-gray-100 ${getNotificationBgColor(type)} hover:brightness-95 transition-all duration-300 relative overflow-hidden cursor-pointer active:bg-gray-100`}
    >
      {/* Background layer */}
      <div className="absolute inset-0 w-full h-full bg-white opacity-80"></div>
      
      {/* Alert bell animation */}
      <NotificationAlert isAlertActive={isAlertActive} />
      
      {/* Device info and icon */}
      <div className="flex items-center relative z-10 w-[60%] h-[60px] py-2">
        <NotificationIcon 
          symbol={symbol}
          name={name}
          type={type}
          enabled={enabled}
        />
        <div className="min-w-0 h-full flex items-center">
          <div className="flex flex-col justify-center space-y-1">
            <h3 className="font-medium text-sm text-gray-800 truncate">{name}</h3>
            <span className="text-xs text-gray-500 truncate">{deviceName}</span>
          </div>
        </div>
      </div>

      {/* Notification values */}
      <div className="text-right flex items-center justify-end relative z-10 w-[38%] h-[60px] py-2">
        <NotificationValue 
          latestValue={latestValue}
          latestTimestamp={latestTimestamp}
          enabled={enabled}
          threshold={threshold}
          type={type}
          isAlertActive={isAlertActive}
        />
      </div>
    </div>
  );
};

export default NotificationItem;
