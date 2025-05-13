
import React from "react";
import { ArrowUpRight, ArrowDownRight, Wheat } from "lucide-react";

type AssetCardProps = {
  symbol: string;
  name: string;
  value: string;
  amount: string;
  percentageChange: number;
  iconColor: string;
  date?: string;
  priceColor?: string;
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
}) => {
  // สร้าง shortcode จากชื่อสกุลเงิน ถ้าเป็นชื่อข้าวให้แสดงตัวอักษรแรกแทน
  const getSymbolShortcode = () => {
    if (symbol.includes('BTC')) return 'BTC';
    if (symbol.includes('ETH')) return 'ETH';
    return symbol.split(' ')[0].charAt(0);
  };

  // ดึงเอาเฉพาะตัวเลขเพื่อแสดงผล
  const getValueDisplay = () => {
    if (!value || value === "-") {
      return "-"; // Return the hyphen for null/empty prices
    }
    
    if (value.includes('-')) {
      // สำหรับช่วงราคา เอาค่าล่าสุด
      const values = value.split('-');
      return values[values.length - 1].trim().replace(',', '');
    }
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
    <div className="bg-white rounded-2xl p-5 shadow-lg border border-emerald-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
      {/* พื้นหลังรูปเมล็ดข้าวที่สวย ใหญ่ และชัดเจน */}
      <div 
        className="absolute inset-0 opacity-10" 
        style={{ 
          backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2IiBmaWxsPSIjMTBiOTgxIj48cGF0aCBkPSJNMTI5LjUsMTcyLjZjLTMuOSwwLTcuMi0wLjUtMTAuNC0yLjZjLTMuMi0yLjEtNi4xLTUuNC03LjItMTAuMWMtMS4xLTQuNy0wLjMtOC4xLDEuNi0xMWMxLjktMi45LDUuNC01LjQsOS41LTcuOGMtMi44LTQuMy0zLjItNy40LTIuNS0xMC4yYzAuNy0yLjcsMi41LTUuMSw0LjctNy4yYzIuMi0yLjEsNS4yLTMuOSw4LjItNS4yYzMtMS4zLDYuMS0yLjEsOC44LTIuMWM3LjgsMCwxMi41LDMuOCwxNSw4LjFjMi41LDQuMywzLjgsOC44LDMuOCwxMi41YzAsNS42LTIuNiwxMC0xMi44LDEzLjFjMTEuMyw0LjQsMTYsMTEuOCwxNCwyMC43Yy0wLjksNC4yLTMuMiw3LjItNi41LDkuM2MtMy4zLDIuMS03LjQsMy4yLTExLjcsMy4xQzEzOS41LDE3My4xLDEzNC4zLDE3Mi42LDEyOS41LDE3Mi42eiBNMTM0LjcsMTI5LjFjLTcuNywyLjYtMTMuOCw3LTEzLjIsMTMuNGMwLjYsNi4zLDUuNSw4LjcsOS45LDguN2M0LjMsMCw3LjQtMS4yLDkuNS0zYzIuMS0xLjgsMy4xLTQuNCwzLjQtNi43QzE0NC42LDEzOC4yLDE0My4xLDEzMy4yLDEzNC43LDEyOS4xeiBNMTMwLjcsMTEzLjRjLTIuNywyLjEtNS4xLDUuNy0zLjcsMTBjOC4xLTIuOCwxMi42LTYuMiwxMi4yLTEwLjljLTAuMi0yLjEtMC45LTQtMi41LTUuNmMtMS42LTEuNS00LjItMi43LTguMy0yLjdjLTEuNiwwLTMuNSwwLjMtNS40LDFjLTEuOSwwLjctMywyLjEtMy43LDMuMUMxMjIuNCwxMDkuNCwxMjcuMSwxMTAuNCwxMzAuNywxMTMuNHoiLz48cGF0aCBkPSJNNzkuOCwxMzAuNGMtNi40LDAtMTIuMS0xLjQtMTYuOS00LjRjLTQuOS0zLTguOS03LjUtMTEuOC0xM2MtMi45LTUuNS00LjYtMTIuMS00LjYtMTguOWMwLTYuNiwxLjMtMTIuMSw0LjUtMTYuNGMzLjItNC4zLDcuOC03LDE0LjYtOGwtMC4yLTAuM2MtMS4xLTIuNy0xLTYuMSwwLjUtOS4zYzEuNS0zLjIsNC41LTYuNCw4LjYtOC40YzQtMiwxMC40LTMuNywxOS4xLTQuM2M2LjMtMC41LDExLjEsMC41LDE0LjQsMi40YzMuMywyLDUuMSw0LjksNS45LDguMmMwLjgsMy4zLDAuNiw2LjktMC45LDEwLjNjNy43LTEuMSwxMy43LDAuMSwxOCwyLjhjNC4zLDIuNyw3LjEsNi44LDguNCwxMS4yYzEuNCw0LjQsMS40LDkuMiwwLjgsMTMuMmMtMC42LDQtMS44LDcuMy0zLjIsOS4yYy0zLjcsNC45LTcuNyw4LjMtMTIsOS41Yy00LjQsMS4yLTcuNywwLjEtMTAuNy0xLjRjLTMtMS41LTYuNC00LjMtOS44LTYuOGMtMy40LTIuNi03LjItNiw3LjYtNC40YzE0LjgsMS42LDEyLjUtMTYuOCw0LjQtMjAuNWMtNC4xLTEuOC05LjYtMS45LTE0LjQtMC4zYy00LjksMS42LTkuMiw0LjctMTIsOWMtMS40LDIuMi0yLjQsNC42LTIuOCw3LjNjLTAuNCwyLjYtMC4zLDUuMywwLjQsOGwwLjksM2MtMi41LTAuMS00LjQtMC4zLTYuNC0wLjlDODEuOSwxMzAuNyw4MC43LDEzMC41LDc5LjgsMTMwLjR6IE0xMDAuMiw3NWMtOS4xLDAuNi0xMy40LDQtMTUuNiw4LjJjLTIuMiw0LjItMS42LDkuMiwwLjIsMTQuMWMxLjgsNC45LDQuOSw5LjYsOC42LDEzYzMuOCwzLjQsOC40LDUuNCwxMy41LDUuNGMwLDAsNCwwLjIsMC42LTJjLTMuNC0yLjItNS41LTQuNy02LjUtNy42Yy0xLTMtMC44LTYuNCwwLjQtOS44YzEuMi0zLjUsMy40LTYuOSw2LjYtOS42YzEuNi0xLjQsMy41LTIuNSw1LjYtMy40Yy0zLjEtMC45LTYuMi0yLjUtOC44LTQuOGMtMi42LTIuMy00LjYtNS4zLTUuNS05LjRMLTUuOCwxNCIvPjwvc3ZnPg==')`,
          backgroundSize: '120px 120px',
          backgroundPosition: 'bottom right 10px'
        }}
      ></div>
      
      <div className="flex flex-col h-full relative z-10">
        <div className="flex justify-between items-center mb-4 px-1">
          {/* Rice Type Icon */}
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-md relative overflow-hidden" 
            style={{ background: `linear-gradient(135deg, ${getBgColor()}, ${getBgColor()}cc)` }}
          >
            <div className="absolute inset-0 bg-white/10 rounded-full"></div>
            <div className="absolute top-0 left-0 w-4 h-4 bg-white/20 rounded-full blur-sm"></div>
            <Wheat className="relative z-10 w-6 h-6 text-white drop-shadow-md" />
          </div>
          
          {/* Rice Name - เพิ่มขนาดตัวอักษร */}
          <div className="text-right px-2">
            <p className="font-bold text-base">{symbol}</p>
          </div>
        </div>
        
        {/* Date display - if available */}
        {date && (
          <div className="mb-2">
            <p className="text-xs text-gray-500">วันที่</p>
            <p className="text-sm">{date}</p>
          </div>
        )}
        
        <div className="mt-auto bg-emerald-50 p-3 -mx-5 -mb-5 rounded-b-2xl border-t border-emerald-100">
          <div className="flex justify-between items-baseline">
            <p className={`font-bold text-lg ${getValueColorClass()}`}>{getValueDisplay()}</p>
            <p className="text-gray-500 text-xs">{amount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
