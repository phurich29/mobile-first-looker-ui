
import React, { useState, useEffect } from "react";
import { ArrowUp, ArrowDown, Wheat, Blend, Circle, Bot, Bell } from "lucide-react";
import { getLatestMeasurement } from "@/components/measurement-history/api";
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
  // ใช้ currentValue ถ้ามี มิฉะนั้นใช้ price (สำหรับความเข้ากันได้กับโค้ดเก่า)
  const valueToShow = currentValue || price || "0";
  
  // State สำหรับการแสดงประวัติการวัด
  const [showHistory, setShowHistory] = useState(false);
  
  // State สำหรับการแจ้งเตือน
  const [latestValue, setLatestValue] = useState<number | null>(parseFloat(valueToShow) || null);
  const [latestTimestamp, setLatestTimestamp] = useState<string | null>(updatedAt ? updatedAt.toISOString() : null);
  const [isAlertActive, setIsAlertActive] = useState(false);
  
  // Always set to true for green color
  const isPositive = true;
  
  // กำหนดสีพื้นหลังตามประเภทของการวัด
  const bgColor = symbol.includes('BTC') ? 'bg-amber-50' : 
                symbol.includes('ETH') ? 'bg-blue-50' : 
                symbol.includes('BNB') ? 'bg-yellow-50' :
                symbol.includes('XRP') ? 'bg-indigo-50' :
                symbol.includes('LTC') ? 'bg-gray-50' : 'bg-purple-50';
  
  // Effect สำหรับดึงข้อมูลล่าสุดทุก 20 วินาที
  useEffect(() => {
    if (!deviceCode || !symbol || !enabled || !notificationType || !threshold) {
      return;
    }

    // ฟังก์ชันสำหรับดึงค่าล่าสุดและตรวจสอบการแจ้งเตือน
    const fetchLatestValue = async () => {
      try {
        const result = await getLatestMeasurement(deviceCode, symbol);
        
        if (result.value !== null) {
          setLatestValue(result.value);
          setLatestTimestamp(result.timestamp);
          
          // ตรวจสอบเงื่อนไขการแจ้งเตือน
          const thresholdValue = parseFloat(threshold);
          
          if (notificationType === 'min') {
            // แจ้งเตือนเมื่อค่าต่ำกว่า threshold
            setIsAlertActive(result.value < thresholdValue);
          } else if (notificationType === 'max') {
            // แจ้งเตือนเมื่อค่าสูงกว่า threshold
            setIsAlertActive(result.value > thresholdValue);
          } else if (notificationType === 'both') {
            // แจ้งเตือนเมื่อค่าอยู่นอกช่วงที่กำหนด (รูปแบบช่วงคือ "min-max")
            const [minThreshold, maxThreshold] = threshold.split('-').map(parseFloat);
            setIsAlertActive(result.value < minThreshold || result.value > maxThreshold);
          }
        }
      } catch (error) {
        console.error("Error fetching latest measurement:", error);
      }
    };

    // เรียกฟังก์ชันเมื่อ component ถูกโหลด
    fetchLatestValue();

    // ตั้ง interval เพื่ออัปเดตค่าทุก 20 วินาที
    const intervalId = setInterval(fetchLatestValue, 20000);

    // ยกเลิก interval เมื่อ component ถูกทำลาย
    return () => clearInterval(intervalId);
  }, [deviceCode, symbol, enabled, notificationType, threshold]);
  
  // Get icon based on category
  const getIcon = () => {
    // Display Blend icon for the "ส่วนผสม" category
    if (symbol === 'whole_kernels' ||
        symbol === 'head_rice' ||
        symbol === 'total_brokens' ||
        symbol === 'small_brokens' ||
        symbol === 'small_brokens_c1') {
      return <Blend className="w-5 h-5 text-white" />;
    }
    
    // Display Circle icon for the "สิ่งเจือปน" category
    if (symbol === 'red_line_rate' ||
        symbol === 'parboiled_red_line' ||
        symbol === 'parboiled_white_rice' ||
        symbol === 'honey_rice' ||
        symbol === 'yellow_rice_rate' ||
        symbol === 'black_kernel' ||
        symbol === 'partly_black_peck' ||
        symbol === 'partly_black' ||
        symbol === 'imperfection_rate' ||
        symbol === 'sticky_rice_rate' ||
        symbol === 'impurity_num' ||
        symbol === 'paddy_rate' ||
        symbol === 'whiteness' ||
        symbol === 'process_precision') {
      return <Circle className="w-5 h-5 text-white" />;
    }
    
    // Display Wheat icon for rice classes and types
    if (symbol.includes('class') || 
        symbol === 'short_grain' || 
        symbol === 'slender_kernel' ||
        symbol.includes('ข้าว')) {
      return <Wheat className="w-5 h-5 text-white" />;
    }
    
    return <span className="text-white font-bold text-sm relative z-10">{symbol.split('/')[0]}</span>;
  };
  
  // Format the Bangkok time (+7)
  const formatBangkokTime = (date?: Date): { thaiDate: string; thaiTime: string } => {
    if (!date) return { thaiDate: "ไม่มีข้อมูล", thaiTime: "ไม่มีข้อมูล" };
    
    // เพิ่มเวลาอีก 7 ชั่วโมง
    const adjustedDate = new Date(date);
    adjustedDate.setHours(adjustedDate.getHours() + 7);
    
    // แยกวันที่และเวลาเป็นคนละบรรทัด
    const dateOptions: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    };
    
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    
    const thaiDate = new Intl.DateTimeFormat('th-TH', dateOptions).format(adjustedDate);
    const thaiTime = new Intl.DateTimeFormat('th-TH', timeOptions).format(adjustedDate);
    
    return { thaiDate, thaiTime };
  };
  
  // ฟังก์ชันจัดการการคลิกเพื่อดูประวัติ
  const handleClick = () => {
    if (deviceCode) {
      setShowHistory(true);
    }
  };

  // ฟังก์ชันปิดหน้าประวัติ
  const handleCloseHistory = () => {
    setShowHistory(false);
  };

  // แสดงข้อความการแจ้งเตือน
  const getNotificationText = () => {
    if (!enabled || !notificationType) return null;
    
    return (
      <div className="text-[10px] text-orange-600 font-medium ml-1">
        {notificationType === 'min' ? `เตือนเมื่อต่ำกว่า ${threshold}%` : 
         notificationType === 'max' ? `เตือนเมื่อสูงกว่า ${threshold}%` : 
         `เตือนเมื่อนอกช่วง ${threshold}%`}
      </div>
    );
  };

  return (
    <>
      <div 
        onClick={handleClick}
        className={`flex items-center justify-between p-4 border-b border-gray-100 ${bgColor} hover:brightness-95 transition-all duration-300 relative overflow-hidden ${deviceCode ? 'cursor-pointer active:bg-gray-100' : ''} ${isAlertActive ? 'bg-red-50/90' : ''}`}
      >
        {/* เพิ่มองค์ประกอบด้านหลังเพื่อความมีมิติ */}
        <div className="absolute inset-0 w-full h-full bg-white opacity-80"></div>
        
        <div className="flex items-center relative z-10">
          <div className="relative">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center mr-3 shadow-md relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${iconColor}, ${iconColor}cc)` }}
            >
              <div className="absolute inset-0 bg-white/10"></div>
              <div className="absolute top-0 left-0 w-3 h-3 bg-white/30 rounded-full blur-sm"></div>
              {getIcon()}
            </div>
            
            {/* แสดงไอคอน Bell เมื่อมีการแจ้งเตือนถูกเปิดใช้งานและกำลังเกิดการแจ้งเตือน */}
            {enabled && notificationType && (
              <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-md">
                {isAlertActive ? (
                  <Bell size={16} className="text-red-500 bell-animation" />
                ) : (
                  <Bot size={16} className="text-orange-500" />
                )}
              </div>
            )}
          </div>
          
          <div className="px-3 py-2 flex-1">
            <div className="flex flex-col">
              <div className="flex flex-col">
                <h3 className="font-bold text-base text-gray-800">{name}</h3>
                <div className="flex items-center">
                  <span className="text-xs text-gray-500">{symbol}</span>
                  {/* ย้ายข้อความการแจ้งเตือนมาไว้ด้านซ้าย */}
                  {getNotificationText()}
                </div>
              </div>
              {deviceName && (
                <span className="text-xs text-gray-500 mt-0.5">{deviceName}</span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right flex flex-col items-end relative z-10">
          <p className={`font-bold text-base ${isAlertActive ? 'text-red-600 value-blink' : 'text-green-600'}`}>
            {valueToShow}%
          </p>
          
          <div className="flex flex-col text-xs">
            {updatedAt ? (
              <>
                <div className="font-medium text-gray-700">{formatBangkokTime(updatedAt).thaiDate}</div>
                <div className="text-gray-500">{formatBangkokTime(updatedAt).thaiTime} น.</div>
              </>
            ) : (
              <div className="text-gray-500">"ไม่มีข้อมูล"</div>
            )}
          </div>
        </div>
        
        {/* Notification alert bell for active alerts (position adjusted for better visibility) */}
        {isAlertActive && enabled && notificationType && (
          <div className="absolute top-1/2 right-1/4 transform -translate-y-1/2 z-20 bell-animation">
            <Bell size={18} className="text-yellow-400 fill-yellow-400" />
          </div>
        )}
      </div>
    </>
  );
};
