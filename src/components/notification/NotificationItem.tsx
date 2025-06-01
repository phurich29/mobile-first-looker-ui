
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getLatestMeasurement } from "../measurement-history/api";
import { getNotificationBgColor } from "./notification-utils";
import NotificationIcon from "./NotificationIcon";
import NotificationValue from "./NotificationValue";
import NotificationAlert from "./NotificationAlert";
import { NotificationSettingsDialog } from "../measurement-history/notification-settings";
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
  const fetchTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [latestValue, setLatestValue] = useState<number | null>(null);
  const [latestTimestamp, setLatestTimestamp] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Memoized fetch function to reduce re-creations
  const fetchLatestValue = useCallback(async () => {
    if (!deviceCode || !symbol) return;
    
    setIsLoading(true);
    try {
      const result = await getLatestMeasurement(deviceCode, symbol);
      
      // Only update state if component is still mounted and values changed
      if (result.value !== latestValue || result.timestamp !== latestTimestamp) {
        setLatestValue(result.value);
        setLatestTimestamp(result.timestamp);
        
        // Check if alert conditions are met
        if (result.value !== null && enabled) {
          const thresholdValue = parseFloat(threshold);
          let alertActive = false;
          
          if (type === 'min') {
            alertActive = result.value < thresholdValue;
          } else if (type === 'max') {
            alertActive = result.value > thresholdValue;
          } else if (type === 'both') {
            // For 'both' type, threshold is in format "min - max"
            const [minThreshold, maxThreshold] = threshold
              .split('-')
              .map(val => parseFloat(val.trim()));
              
            alertActive = result.value < minThreshold || result.value > maxThreshold;
          }
          
          setIsAlertActive(alertActive);
        } else {
          setIsAlertActive(false);
        }
      }
    } catch (error) {
      console.error("Error fetching latest value:", error);
    } finally {
      setIsLoading(false);
    }
  }, [deviceCode, symbol, threshold, type, enabled, latestValue, latestTimestamp]);
  
  // Effect for initial fetch and setting up interval
  useEffect(() => {
    fetchLatestValue();
    
    // Update values every 20 seconds
    fetchTimerRef.current = setInterval(fetchLatestValue, 20000);
    
    // Cleanup
    return () => {
      if (fetchTimerRef.current) {
        clearInterval(fetchTimerRef.current);
      }
    };
  }, [fetchLatestValue]);

  // Navigate to measurement history for the specific device and parameter
  const handleClick = () => {
    navigate(`/measurement-history/${deviceCode}/${symbol}?name=${encodeURIComponent(name)}`);
  };

  // Open the notification settings dialog for this specific item
  const handleBackgroundClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    navigate('/settings/notifications'); // Navigate to the custom notifications page
  };

  return (
    <>
      <div 
        onClick={handleClick}
        className={`flex items-center justify-between py-3 px-3 border-b border-gray-100 dark:border-gray-700 ${getNotificationBgColor(type)} hover:brightness-95 transition-all duration-300 relative overflow-hidden cursor-pointer active:bg-gray-100 dark:active:bg-gray-700`}
      >
        {/* Background layer - now opens settings dialog for this notification */}
        <div 
          className="absolute inset-0 w-full h-full bg-white dark:bg-gray-800 opacity-80 dark:opacity-60 cursor-pointer"
          onClick={handleBackgroundClick}
        ></div>
        
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
              <h3 className="font-medium text-sm text-gray-800 dark:text-gray-100 truncate">{name}</h3>
              <div className="flex items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{deviceName}</span>
                {/* Add notification type text here with consistent styling */}
                {enabled && (
                  <div className="text-[10px] text-orange-600 dark:text-orange-400 font-medium ml-1">
                    {type === 'min' ? `เตือนเมื่อต่ำกว่า ${threshold}%` : 
                     type === 'max' ? `เตือนเมื่อสูงกว่า ${threshold}%` : 
                     `เตือนเมื่อนอกช่วง ${threshold}%`}
                  </div>
                )}
              </div>
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

      {/* Add the dialog for this specific notification's settings */}
      <NotificationSettingsDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        deviceCode={deviceCode}
        symbol={symbol}
        name={name}
      />
    </>
  );
};

export default NotificationItem;

