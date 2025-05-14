
import React, { useState } from "react";
import { ArrowUp, ArrowDown, Wheat, Blend, Circle } from "lucide-react";

type MeasurementItemProps = {
  symbol: string;
  name: string;
  price: string; // Latest value (percentage)
  percentageChange: number; // Change compared to previous value
  iconColor: string;
  updatedAt?: Date; // Updated timestamp
  deviceCode?: string; // รหัสอุปกรณ์สำหรับดึงข้อมูลประวัติ
};

export const MeasurementItem: React.FC<MeasurementItemProps> = ({
  symbol,
  name,
  price,
  percentageChange,
  iconColor,
  updatedAt,
  deviceCode,
}) => {
  // State สำหรับการแสดงประวัติการวัด
  const [showHistory, setShowHistory] = useState(false);
  const isPositive = percentageChange >= 0;
  
  // กำหนดสีพื้นหลังตามประเภทของการวัด
  const bgColor = symbol.includes('BTC') ? 'bg-amber-50' : 
                symbol.includes('ETH') ? 'bg-blue-50' : 
                symbol.includes('BNB') ? 'bg-yellow-50' :
                symbol.includes('XRP') ? 'bg-indigo-50' :
                symbol.includes('LTC') ? 'bg-gray-50' : 'bg-purple-50';
  
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

  return (
    <>
      <div 
        onClick={handleClick}
        className={`flex items-center justify-between p-4 border-b border-gray-100 ${bgColor} hover:brightness-95 transition-all duration-300 relative overflow-hidden ${deviceCode ? 'cursor-pointer active:bg-gray-100' : ''}`}
      >
        {/* เพิ่มองค์ประกอบด้านหลังเพื่อความมีมิติ */}
        <div className="absolute inset-0 w-full h-full bg-white opacity-80"></div>
        
        <div className="flex items-center relative z-10">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center mr-3 shadow-md relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${iconColor}, ${iconColor}cc)` }}
          >
            <div className="absolute inset-0 bg-white/10"></div>
            <div className="absolute top-0 left-0 w-3 h-3 bg-white/30 rounded-full blur-sm"></div>
            {getIcon()}
          </div>
          <div className="px-3 py-2">
            <div className="flex flex-col">
              <div className="flex items-center">
                <h3 className="font-bold text-base text-gray-800">{name}</h3>
              </div>
              <span className="text-xs text-gray-500">{symbol}</span>
            </div>
          </div>
        </div>
        <div className="text-right flex flex-col items-end relative z-10">
          <p className={`font-bold text-base ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {price}%
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
      </div>
    </>
  );
};
