
import React from "react";
import { ArrowUpRight, ArrowDownRight, Wheat, ExternalLink } from "lucide-react";

type AssetCardProps = {
  symbol: string;
  name: string;
  value: string;
  amount: string;
  percentageChange: number;
  iconColor: string;
  date?: string;
  priceColor?: string;
  clickable?: boolean;
  onClick?: () => void;
};

export const AssetCard: React.FC<AssetCardProps> = ({
  symbol,
  name,
  value,
  amount,
  percentageChange,
  iconColor,
  date,
  priceColor,
  clickable = false,
  onClick,
}) => {
  // สร้าง shortcode จากชื่อสกุลเงิน ถ้าเป็นชื่อข้าวให้แสดงตัวอักษรแรกแทน
  const getSymbolShortcode = () => {
    if (symbol.includes('BTC')) return 'BTC';
    if (symbol.includes('ETH')) return 'ETH';
    return symbol.split(' ')[0].charAt(0);
  };

  // แสดงค่าราคาที่ได้รับมา
  const getValueDisplay = () => {
    if (!value || value === "-") {
      return "-"; // แสดงเครื่องหมายขีดสำหรับค่าว่างหรือ null
    }
    
    // ค่า value ได้ผ่านการ format มาแล้วจาก formatPrice ใน RicePriceCarousel
    // จึงสามารถแสดงค่าได้เลย
    return value;
  };

  // เปลี่ยนค่า iconColor เพื่อให้สอดคล้องกับ theme สีเขียวพรีเมี่ยม
  const getBgColor = () => {
    return '#10b981'; // สีเขียว emerald-500 (default)
  };

  // Get text color class based on price color
  const getValueColorClass = () => {
    switch (priceColor) {
      case 'green': return 'text-emerald-600';
      case 'red': return 'text-red-600';
      default: return 'text-gray-900';
    }
  };

  return (
    <div 
      className={`bg-white rounded-xl shadow-md border border-emerald-100 hover:shadow-lg transition-all duration-300 relative overflow-hidden h-full flex flex-col ${clickable ? 'cursor-pointer hover:border-emerald-300' : ''}`}
      onClick={clickable && onClick ? onClick : undefined}
    >
      {/* พื้นหลังรูปเมล็ดข้าว - ย้ายไปอยู่ด้านหลังและปรับขนาดให้เหมาะสม */}
      <div 
        className="absolute inset-0 opacity-5" 
        style={{ 
          backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2IiBmaWxsPSIjMTBiOTgxIj48cGF0aCBkPSJNMTI5LjUsMTcyLjZjLTMuOSwwLTcuMi0wLjUtMTAuNC0yLjZjLTMuMi0yLjEtNi4xLTUuNC03LjItMTAuMWMtMS4xLTQuNy0wLjMtOC4xLDEuNi0xMWMxLjktMi45LDUuNC01LjQsOS41LTcuOGMtMi44LTQuMy0zLjItNy40LTIuNS0xMC4yYzAuNy0yLjcsMi41LTUuMSw0LjctNy4yYzIuMi0yLjEsNS4yLTMuOSw4LjItNS4yYzMtMS4zLDYuMS0yLjEsOC44LTIuMWM3LjgsMCwxMi41LDMuOCwxNSw4LjFjMi41LDQuMywzLjgsOC44LDMuOCwxMi41YzAsNS42LTIuNiwxMC0xMi44LDEzLjFjMTEuMyw0LjQsMTYsMTEuOCwxNCwyMC43Yy0wLjksNC4yLTMuMiw3LjItNi41LDkuM2MtMy4zLDIuMS03LjQsMy4yLTExLjcsMy4xQzEzOS41LDE3My4xLDEzNC4zLDE3Mi42LDEyOS41LDE3Mi42eiBNMTM0LjcsMTI5LjFjLTcuNywyLjYtMTMuOCw3LTEzLjIsMTMuNGMwLjYsNi4zLDUuNSw4LjcsOS45LDguN2M0LjMsMCw3LjQtMS4yLDkuNS0zYzIuMS0xLjgsMy4xLTQuNCwzLjQtNi43QzE0NC42LDEzOC4yLDE0My4xLDEzMy4yLDEzNC43LDEyOS4xeiBNMTMwLjcsMTEzLjRjLTIuNywyLjEtNS4xLDUuNy0zLjcsMTBjOC4xLTIuOCwxMi42LTYuMiwxMi4yLTEwLjljLTAuMi0yLjEtMC45LTQtMi41LTUuNmMtMS42LTEuNS00LjItMi43LTguMy0yLjdjLTEuNiwwLTMuNSwwLjMtNS40LDFjLTEuOSwwLjctMywyLjEtMy43LDMuMUMxMjIuNCwxMDkuNCwxMjcuMSwxMTAuNCwxMzAuNywxMTMuNHoiLz48cGF0aCBkPSJNNzkuOCwxMzAuNGMtNi40LDAtMTIuMS0xLjQtMTYuOS00LjRjLTQuOS0zLTguOS03LjUtMTEuOC0xM2MtMi45LTUuNS00LjYtMTIuMS00LjYtMTguOWMwLTYuNiwxLjMtMTIuMSw0LjUtMTYuNGMzLjItNC4zLDcuOC03LDE0LjYtOGwtMC4yLTAuM2MtMS4xLTIuNy0xLTYuMSwwLjUtOS4zYzEuNS0zLjIsNC41LTYuNCw4LjYtOC40YzQtMiwxMC40LTMuNywxOS4xLTQuM2M2LjMtMC41LDExLjEsMC41LDE0LjQsMi40YzMuMywyLDUuMSw0LjksNS45LDguMmMwLjgsMy4zLDAuNiw2LjktMC45LDEwLjNjNy43LTEuMSwxMy43LDAuMSwxOCwyLjhjNC4zLDIuNyw3LjEsNi44LDguNCwxMS4yYzEuNCw0LjQsMS40LDkuMiwwLjgsMTMuMmMtMC42LDQtMS44LDcuMy0zLjIsOS4yYy0zLjcsNC45LTcuNyw4LjMtMTIsOS41Yy00LjQsMS4yLTcuNywwLjEtMTAuNy0xLjRjLTMtMS41LTYuNC00LjMtOS44LTYuOGMtMy40LTIuNi03LjItNiw3LjYtNC40YzE0LjgsMS42LDEyLjUtMTYuOCw0LjQtMjAuNWMtNC4xLTEuOC05LjYtMS45LTE0LjQtMC4zYy00LjksMS42LTkuMiw0LjctMTIsOWMtMS40LDIuMi0yLjQsNC42LTIuOCw3LjNjLTAuNCwyLjYtMC4zLDUuMywwLjQsOGwwLjksM2MtMi41LTAuMS00LjQtMC4zLTYuNC0wLjlDODEuOSwxMzAuNyw4MC43LDEzMC41LDc5LjgsMTMwLjR6IE0xMDAuMiw3NWMtOS4xLDAuNi0xMy40LDQtMTUuNiw4LjJjLTIuMiw0LjItMS42LDkuMiwwLjIsMTQuMWMxLjgsNC45LDQuOSw5LjYsOC42LDEzYzMuOCwzLjQsOC40LDUuNCwxMy41LDUuNGMwLDAsNCwwLjIsMC42LTJjLTMuNC0yLjItNS41LTQuNy02LjUtNy42Yy0xLTMtMC44LTYuNCwwLjQtOS44YzEuMi0zLjUsMy40LTYuOSw2LjYtOS42YzEuNi0xLjQsMy41LTIuNSw1LjYtMy40Yy0zLjEtMC45LTYuMi0yLjUtOC44LTQuOGMtMi42LTIuMy00LjYtNS4zLTUuNS05LjRMLTUuOCwxNCIvPjwvc3ZnPg==')`,
          backgroundSize: '100px 100px',
          backgroundPosition: 'center 40%',
          backgroundRepeat: 'no-repeat'
        }}
      ></div>
      
      {/* สัญลักษณ์แสดงว่าคลิกได้ */}
      {clickable && (
        <div className="absolute top-2 right-2 z-20">
          <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
        </div>
      )}
      
      {/* ส่วนหัว */}
      <div className="p-3 relative z-10 flex-grow">
        <div className="flex justify-between items-center mb-3">
          {/* ไอคอนข้าว */}
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm relative overflow-hidden" 
            style={{ background: `linear-gradient(135deg, ${getBgColor()}, ${getBgColor()}cc)` }}
          >
            <div className="absolute inset-0 bg-white/10 rounded-full"></div>
            <Wheat className="relative z-10 w-5 h-5 text-white drop-shadow-sm" />
          </div>
          
          {/* ชื่อข้าว */}
          <div className="text-center flex-grow ml-2 truncate">
            <p className="font-bold text-sm truncate">{symbol}</p>
          </div>
        </div>
        
        {/* ราคา - ย้ายมาด้านบน */}
        <div className="mb-3">
          <div className="flex items-baseline">
            <p className={`font-bold text-lg ${getValueColorClass()}`}>{getValueDisplay()}</p>
            <p className="text-gray-500 text-sm ml-1 font-medium">{amount}</p>
          </div>
        </div>
      </div>
      
      {/* ส่วนวันที่ - ย้ายลงด้านล่าง */}
      <div className="mt-auto bg-emerald-50 p-2.5 rounded-b-xl border-t border-emerald-100">
        {date ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">วันที่</p>
              <p className="text-xs text-gray-700">{date}</p>
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 text-emerald-600 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <p className="text-xs text-gray-500">ไม่ระบุวันที่</p>
          </div>
        )}
      </div>
    </div>
  );
}
