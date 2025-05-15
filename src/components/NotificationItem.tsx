
import React, { useEffect, useState } from "react";
import { Bell, BellOff, CircleAlert, AlertTriangle, ThermometerSnowflake, GaugeCircle, ArrowUp, ArrowDown, Wheat } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getLatestMeasurement } from "./measurement-history/api";

type NotificationItemProps = {
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
  
  // สร้าง state สำหรับเก็บค่าล่าสุดที่ดึงมาจาก API
  const [latestValue, setLatestValue] = useState<number | null>(null);
  const [latestTimestamp, setLatestTimestamp] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAlertActive, setIsAlertActive] = useState(false);
  
  // ดึงข้อมูลค่าล่าสุดจาก API
  useEffect(() => {
    const fetchLatestValue = async () => {
      if (!deviceCode || !symbol) return;
      
      setIsLoading(true);
      try {
        const result = await getLatestMeasurement(deviceCode, symbol);
        setLatestValue(result.value);
        setLatestTimestamp(result.timestamp);
        
        // ตรวจสอบว่าเข้าเงื่อนไขการแจ้งเตือนหรือไม่
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
    
    // อัพเดทค่าทุก 30 วินาที
    const intervalId = setInterval(fetchLatestValue, 30000);
    return () => clearInterval(intervalId);
  }, [deviceCode, symbol, threshold, type, enabled]);
  // กำหนดสีพื้นหลังตามประเภทของการแจ้งเตือน
  const getBgColor = () => {
    if (type === 'min') return 'bg-blue-50';
    if (type === 'max') return 'bg-orange-50';
    return 'bg-purple-50'; // both
  };
  
  // กำหนดสีไอคอนตามประเภท
  const getIconColor = () => {
    if (type === 'min') return '#3b82f6'; // blue
    if (type === 'max') return '#f97316'; // orange
    return '#8b5cf6'; // purple
  };
  
  // Get icon based on rice type and notification type - updated to match device details page
  const getIcon = () => {
    if (!enabled) {
      return <BellOff className="w-5 h-5 text-white" />;
    }
    
    // Match rice type symbols from device details page
    if (symbol === 'class1' || name.includes('ชั้น1')) {
      return <Wheat className="w-5 h-5 text-white" />;
    }
    
    if (symbol === 'class2' || name.includes('ชั้น2')) {
      return <Wheat className="w-5 h-5 text-white" />;
    }
    
    if (symbol === 'class3' || name.includes('ชั้น3')) {
      return <Wheat className="w-5 h-5 text-white" />;
    }
    
    // For regular threshold notifications
    if (type === 'min') {
      return <ArrowDown className="w-5 h-5 text-white" />;
    }
    
    if (type === 'max') {
      return <ArrowUp className="w-5 h-5 text-white" />;
    }
    
    return <GaugeCircle className="w-5 h-5 text-white" />; // both
  };
  
  // แปลง timestamp เป็นเวลาในรูปแบบ HH:MM
  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    
    // เพิ่มเวลาอีก 7 ชั่วโมงสำหรับเวลาในประเทศไทย
    const thailandTime = new Date(date.getTime() + (7 * 60 * 60 * 1000));
    
    // แสดงในรูปแบบ HH:MM
    const hours = thailandTime.getHours().toString().padStart(2, '0');
    const minutes = thailandTime.getMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes}`;
  };
  
  // คำนวณเวลา Bangkok (+7)
  const formatBankgokTime = (date?: Date): { thaiDate: string; thaiTime: string } => {
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

  // ฟังก์ชันจัดการการคลิกเพื่อนำทางไปยังหน้ารายละเอียดค่าของอุปกรณ์
  const handleClick = () => {
    // นำทางไปยังหน้ารายละเอียดค่าของอุปกรณ์ (MeasurementHistory)
    navigate(`/measurement-history/${deviceCode}/${symbol}?name=${encodeURIComponent(name)}`);
  };

  // ข้อความสถานะการแจ้งเตือน
  const getRuleName = () => {
    if (!enabled) return "ปิดแจ้งเตือน";
    
    if (type === 'min') {
      return "น้อยกว่า";
    }
    
    if (type === 'max') {
      return "มากกว่า";
    }
    
    return "นอกช่วง";
  };
  
  // ค่าตัวเลข
  const getThresholdValue = () => {
    if (!enabled) return "";
    
    if (type === 'min' || type === 'max') {
      return `${threshold}%`;
    }
    
    return threshold;
  };

  return (
    <div 
      onClick={handleClick}
      className={`flex items-center justify-between py-3 px-3 border-b border-gray-100 ${getBgColor()} hover:brightness-95 transition-all duration-300 relative overflow-hidden cursor-pointer active:bg-gray-100`}
    >
      {/* เพิ่มองค์ประกอบด้านหลังเพื่อความมีมิติ */}
      <div className="absolute inset-0 w-full h-full bg-white opacity-80"></div>
      
      {/* ลบการแสดงค่าล่าสุดชิดขวาบนออก เพราะจะย้ายไปอยู่ในกรอบเดียวกับกฎ */}
      
      <div className="flex items-center relative z-10 w-[60%] h-[60px] py-2">
        <div 
          className="shrink-0 rounded-full flex items-center justify-center mr-3 shadow-sm relative overflow-hidden"
          style={{ 
            background: `linear-gradient(135deg, ${getIconColor()}, ${getIconColor()}cc)`,
            width: '40px',
            height: '40px'
          }}
        >
          <div className="absolute inset-0 bg-white/10"></div>
          <div className="absolute top-0 left-0 w-2 h-2 bg-white/30 rounded-full blur-sm"></div>
          <div className="flex items-center justify-center w-full h-full">
            {getIcon()}
          </div>
        </div>
        <div className="min-w-0 h-full flex items-center"> {/* min-w-0 ช่วยให้ truncate ทำงานได้ถูกต้อง */}
          <div className="flex flex-col justify-center space-y-1">
            <h3 className="font-medium text-sm text-gray-800 truncate">{name}</h3>
            <span className="text-xs text-gray-500 truncate">{deviceName}</span>
          </div>
        </div>
      </div>

      <div className="text-right flex items-center justify-end relative z-10 w-[38%] h-[60px] py-2">
        <div className="bg-gray-50/80 px-3 py-1.5 rounded-lg flex flex-col items-end justify-center min-h-[54px] min-w-[100px] space-y-0.5">
          {/* แสดงค่าล่าสุดพร้อมเวลา */}
          {latestValue !== null && latestTimestamp && (
            <p className={`font-medium text-xs ${isAlertActive ? 'text-red-600 font-bold' : 'text-gray-700'} leading-tight`}>
              {formatTime(latestTimestamp)} {latestValue.toFixed(1)}%
            </p>
          )}
          
          {/* แสดงชื่อกฎ */}
          <p className={`font-medium text-xs ${enabled ? 'text-green-600' : 'text-gray-500'} leading-tight`}>
            {getRuleName()}
          </p>
          
          {/* แสดงค่าตัวเลข */}
          <p className={`font-medium text-xs ${enabled ? 'text-green-600 font-bold' : 'text-gray-500'} leading-tight`}>
            {getThresholdValue()}
          </p>
        </div>
      </div>
    </div>
  );
};
