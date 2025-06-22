
import React from "react";
import { useMeasurement } from "./measurement/useMeasurement";
import { NotificationIcon } from "./measurement/NotificationIcon";
import { TimeDisplay } from "./measurement/TimeDisplay";
import { NotificationText } from "./measurement/NotificationText";
import { AlertBell } from "./measurement/AlertBell";
import { MeasurementValue } from "./measurement/MeasurementValue";
import "./notification-item-animation.css";

type MeasurementItemProps = {
  symbol: string;
  name: string;
  price?: string; // Old prop - for backwards compatibility
  currentValue?: string; // Latest value (percentage)
  percentageChange?: number; // Change compared to previous value
  iconColor: string;
  updatedAt?: Date; // Updated timestamp
  deviceCode?: string; // รหัสอุปกรณ์สำหรับดึงข้อมูลประวัติ
  deviceName?: string; // ชื่ออุปกรณ์
  notificationType?: 'min' | 'max' | 'both'; // ประเภทการแจ้งเตือน
  threshold?: string; // ค่าขีดจำกัดการแจ้งเตือน
  enabled?: boolean; // สถานะการแจ้งเตือน
};

export const MeasurementItem: React.FC<MeasurementItemProps> = ({
  symbol,
  name,
  price,
  currentValue,
  percentageChange = 0,
  iconColor,
  updatedAt,
  deviceCode,
  deviceName,
  notificationType,
  threshold,
  enabled = true,
}) => {
  // Use the measurement hook to manage states and fetch data
  const {
    valueToShow,
    isAlertActive
  } = useMeasurement({
    symbol,
    initialValue: currentValue || price,
    deviceCode,
    notificationType,
    threshold,
    enabled
  });
  
  return (
    <>
      <div 
        className={`flex items-center justify-between p-4 border-b border-emerald-200/50 bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 dark:border-emerald-800/30 hover:bg-white/90 hover:border-emerald-300/60 dark:hover:bg-slate-900/90 dark:hover:border-emerald-700/40 transition-all duration-300 relative overflow-hidden ${deviceCode ? 'cursor-pointer active:bg-emerald-50/50 dark:active:bg-emerald-950/30' : ''} ${isAlertActive ? 'bg-red-50/90 dark:bg-red-900/50' : ''}`}
      >
        {/* เพิ่มองค์ประกอบด้านหลังเพื่อความมีมิติ */}
        <div className="absolute inset-0 w-full h-full bg-white/10 backdrop-blur-sm dark:bg-slate-800/10"></div>
        
        <div className="flex items-center relative z-10">
          <NotificationIcon 
            symbol={symbol}
            iconColor={iconColor}
            enabled={enabled}
            isAlertActive={isAlertActive}
          />
          
          <div className="px-3 py-2 flex-1">
            <div className="flex flex-col">
              <div className="flex flex-col">
                <h3 className="font-bold text-base text-emerald-800 dark:text-emerald-200">{name}</h3>
                <div className="flex items-center">
                  <span className="text-xs text-emerald-500 dark:text-emerald-400">{symbol}</span>
                  <NotificationText 
                    enabled={enabled}
                    notificationType={notificationType}
                    threshold={threshold}
                  />
                </div>
              </div>
              {deviceName && (
                <span className="text-xs text-emerald-500 dark:text-emerald-400 mt-0.5">{deviceName}</span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right flex flex-col items-end relative z-10">
          <MeasurementValue value={valueToShow} isAlertActive={isAlertActive} />
          <TimeDisplay updatedAt={updatedAt} />
        </div>
        
        {/* Notification alert bell */}
        <AlertBell 
          isAlertActive={isAlertActive}
          enabled={enabled}
          notificationType={notificationType}
        />
      </div>
    </>
  );
};
