
import React from "react";
import { Bell, BellOff, CircleAlert, AlertTriangle, ThermometerSnowflake, GaugeCircle, ArrowUp, ArrowDown, Wheat } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  
  // Format the Bangkok time (+7)
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
  const getStatusText = () => {
    if (!enabled) return "ปิดแจ้งเตือน";
    
    if (type === 'min') {
      return `น้อยกว่า ${threshold}%`;
    }
    
    if (type === 'max') {
      return `มากกว่า ${threshold}%`;
    }
    
    return `นอกช่วง ${threshold}`;
  };

  return (
    <div 
      onClick={handleClick}
      className={`flex items-center justify-between py-2 px-3 border-b border-gray-100 ${getBgColor()} hover:brightness-95 transition-all duration-300 relative overflow-hidden cursor-pointer active:bg-gray-100`}
    >
      {/* เพิ่มองค์ประกอบด้านหลังเพื่อความมีมิติ */}
      <div className="absolute inset-0 w-full h-full bg-white opacity-80"></div>
      
      <div className="flex items-center relative z-10">
        <div 
          className="rounded-full flex items-center justify-center mr-2 shadow-sm relative overflow-hidden"
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
        <div className="py-1">
          <div className="flex flex-col">
            <div className="flex items-center">
              <h3 className="font-medium text-sm text-gray-800 truncate max-w-[170px]">{name}</h3>
            </div>
            <span className="text-xs text-gray-500 truncate max-w-[180px]">{deviceName}</span>
          </div>
        </div>
      </div>
      <div className="text-right flex flex-col items-end relative z-10">
        <p className={`font-medium text-xs ${enabled ? 'text-green-600' : 'text-gray-500'} mb-0.5 truncate max-w-[120px]`}>
          {getStatusText()}
        </p>
        <a 
          href={`/measurement-history/${deviceCode}/${symbol}?name=${encodeURIComponent(name)}`}
          className="text-xs px-1.5 py-0.5 bg-gray-200 text-black rounded hover:bg-gray-300 transition-colors"
          onClick={(e) => {
            e.stopPropagation(); // ป้องกันการทริกเกอร์ handleClick ของ div พ่อ
            navigate(`/measurement-history/${deviceCode}/${symbol}?name=${encodeURIComponent(name)}`);
            return false;
          }}
        >
          ดูรายละเอียด
        </a>
      </div>
    </div>
  );
};
