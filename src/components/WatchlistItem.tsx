
import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

type WatchlistItemProps = {
  symbol: string;
  name: string;
  price: string;
  percentageChange: number;
  iconColor: string;
};

export const WatchlistItem: React.FC<WatchlistItemProps> = ({
  symbol,
  name,
  price,
  percentageChange,
  iconColor,
}) => {
  // Always set to positive (green)
  const isPositive = true;
  
  // ตั้งค่าสีพื้นหลังตามชั้นคุณภาพของข้าว
  let bgColor = "bg-white";
  
  if (symbol === "ชั้น 1") {
    bgColor = "bg-green-50";
  } else if (symbol === "ชั้น 2") {
    bgColor = "bg-yellow-50";
  } else if (symbol === "ชั้น 3") {
    bgColor = "bg-orange-50";
  } else if (symbol === "ความขาว") {
    bgColor = "bg-blue-50";
  }
  
  return (
    <div className={`flex items-center justify-between p-4 border-b border-gray-100 ${bgColor} hover:brightness-95 transition-all duration-300 relative overflow-hidden`}>
      {/* เพิ่มองค์ประกอบด้านหลังเพื่อความมีมิติ */}
      <div className="absolute inset-0 w-full h-full bg-white opacity-80"></div>
      
      <div className="flex items-center relative z-10">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center mr-3 shadow-md relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${iconColor}, ${iconColor}cc)` }}
        >
          <div className="absolute inset-0 bg-white/10"></div>
          <div className="absolute top-0 left-0 w-3 h-3 bg-white/30 rounded-full blur-sm"></div>
          <span className="text-white font-bold text-sm relative z-10">{symbol}</span>
        </div>
        <div className="px-3 py-2">
          <div className="flex flex-col">
            <div className="flex items-center">
              <h3 className="font-semibold text-base text-gray-800">{symbol}</h3>
            </div>
            <span className="text-xs text-gray-500">{name}</span>
          </div>
        </div>
      </div>
      <div className="text-right flex flex-col items-end relative z-10">
        <p className="font-bold text-base">{price}</p>
        <div className="flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-600">
          <ArrowUp className="w-3 h-3 mr-1" />
          <span className="text-xs font-medium">{Math.abs(percentageChange)}%</span>
        </div>
      </div>
    </div>
  );
};
