
import React from "react";
import { useMeasurement } from "./measurement/useMeasurement";
import { useAlertSound } from "@/hooks/useAlertSound";
import { NotificationIcon } from "./measurement/NotificationIcon";
import { TimeDisplay } from "./measurement/TimeDisplay";
import { NotificationText } from "./measurement/NotificationText";
import { AlertBell } from "./measurement/AlertBell";
import { MeasurementValue } from "./measurement/MeasurementValue";
import { useTranslation } from "@/hooks/useTranslation";
import "./notification-item-animation.css";

type MeasurementItemProps = {
  symbol: string;
  name: string;
  price?: string; // Old prop - for backwards compatibility
  currentValue?: string; // Latest value (percentage)
  percentageChange?: number; // Change compared to previous value
  iconColor: string;
  updatedAt?: Date; // Updated timestamp
  deviceCode?: string; // รต้นข้าวสอุปกรณ์สำหรับดึงข้อมูลประวัติ
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
  const { t } = useTranslation();
  
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

  // Play alert sound when alert is active and notifications are enabled
  useAlertSound(isAlertActive, enabled);

  // Get translated measurement name
  const getTranslatedName = (measurementName: string) => {
    // Try to get translation from measurements category first
    const translations = {
      'ชั้น 1 (>7.0mm)': 'class1',
      'ชั้น 2 (>6.6-7.0mm)': 'class2',
      'ชั้น 3 (>6.2-6.6mm)': 'class3',
      'เมล็ดสั้น': 'short_grain',
      'ข้าวลีบ': 'slender_kernel',
      'เต็มเมล็ด': 'whole_kernels',
      'ต้นข้าว': 'head_rice',
      'ข้าวหักรวม': 'total_brokens',
      'ปลายข้าว': 'small_brokens',
      'ปลายข้าวC1': 'small_brokens_c1',
      'ปลายข้าว C1': 'small_brokens_c1',
      'สีต่ำกว่ามาตรฐาน': 'red_line_rate',
      'เมล็ดแดง': 'parboiled_red_line',
      'ข้าวดิบ': 'parboiled_white_rice',
      'เมล็ดม่วง': 'honey_rice',
      'เมล็ดเหลือง': 'yellow_rice_rate',
      'เมล็ดดำ': 'black_kernel',
      'ดำบางส่วน & จุดดำ': 'partly_black_peck',
      'ดำบางส่วน': 'partly_black',
      'เมล็ดเสีย': 'imperfection_rate',
      'ข้าวเหนียว': 'sticky_rice_rate',
      'เมล็ดอื่นๆ': 'impurity_num',
      'ข้าวเปลือก(เมล็ด/กก.)': 'paddy_rate',
      'ความขาว': 'whiteness',
      'ระดับขัดสี': 'process_precision',
      'อัตราส่วนผสม': 'mix_rate',
      'อัตราการงอก': 'sprout_rate',
      'อัตราการไม่สุก': 'unripe_rate',
      'อัตราข้าวกล้อง': 'brown_rice_rate',
      'อัตราหลัก': 'main_rate',
      'ดัชนีผสม': 'mix_index',
      'ดัชนีหลัก': 'main_index',
    };

    const translationKey = translations[measurementName];
    if (translationKey) {
      return t('measurements', translationKey as any);
    }
    
    return measurementName;
  };
  
  // กำหนดสีพื้นหลังตามประเภทของการวัด
  const bgColor = symbol.includes('BTC') ? 'bg-amber-50' : 
                symbol.includes('ETH') ? 'bg-blue-50' : 
                symbol.includes('BNB') ? 'bg-yellow-50' :
                symbol.includes('XRP') ? 'bg-indigo-50' :
                symbol.includes('LTC') ? 'bg-gray-50' : 'bg-purple-50';

  return (
    <>
      <div 
        className={`flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 ${bgColor} dark:bg-gray-800 hover:brightness-95 dark:hover:brightness-110 transition-all duration-300 relative overflow-hidden ${deviceCode ? 'cursor-pointer active:bg-gray-100 dark:active:bg-gray-700' : ''} ${isAlertActive ? 'bg-red-50/90 dark:bg-red-900/50' : ''}`}
      >
        {/* เพิ่มองค์ประกอบด้านหลังเพื่อความมีมิติ */}
        <div className="absolute inset-0 w-full h-full bg-white dark:bg-gray-800 opacity-80 dark:opacity-50"></div>
        
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
                <h3 className="font-bold text-base text-gray-800 dark:text-gray-200">{getTranslatedName(name)}</h3>
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{symbol}</span>
                  <NotificationText 
                    enabled={enabled}
                    notificationType={notificationType}
                    threshold={threshold}
                  />
                </div>
              </div>
              {deviceName && (
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{deviceName}</span>
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
