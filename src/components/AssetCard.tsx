
import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

type AssetCardProps = {
  symbol: string;
  name: string;
  value: string;
  amount: string;
  percentageChange: number;
  iconColor: string;
};

export const AssetCard: React.FC<AssetCardProps> = ({
  symbol,
  name,
  value,
  amount,
  percentageChange,
  iconColor,
}) => {
  // สร้าง shortcode จากชื่อสกุลเงิน ถ้าเป็นชื่อข้าวให้แสดงตัวอักษรแรกแทน
  const getSymbolShortcode = () => {
    if (symbol.includes('BTC')) return 'BTC';
    if (symbol.includes('ETH')) return 'ETH';
    return symbol.split(' ')[0].charAt(0);
  };

  // ดึงเอาเฉพาะตัวเลขเพื่อแสดงผล
  const getValueDisplay = () => {
    if (value.includes('-')) {
      // สำหรับช่วงราคา เอาค่าล่าสุด
      const values = value.split('-');
      return values[values.length - 1].trim().replace(',', '');
    }
    return value;
  };

  const getCurrencySymbol = () => {
    if (symbol.includes('BTC')) return 'BTC';
    if (symbol.includes('ETH')) return 'ETH';
    return amount.split('/')[0].trim();
  };

  // เปลี่ยนค่า iconColor เพื่อให้สอดคล้องกับ theme สีเขียวพรีเมี่ยม
  const getBgColor = () => {
    if (symbol.includes('ข้าวหอมมะลิ 100%')) return '#10b981'; // สีเขียว emerald-500
    if (symbol.includes('ปลายข้าว')) return '#059669'; // สีเขียวเข้ม emerald-600
    if (symbol.includes('ข้าวหอมมะลิจังหวัด')) return '#047857'; // สีเขียวเข้มมาก emerald-700
    return '#10b981'; // ค่าเริ่มต้นเป็นสีเขียว emerald-500
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-lg border border-emerald-100 hover:shadow-xl transition-all duration-300">
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          {/* Coin Icon - เพิ่มความมีมิติด้วยการใช้ gradient และ shadow */}
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-md relative overflow-hidden" 
            style={{ background: `linear-gradient(135deg, ${getBgColor()}, ${getBgColor()}cc)` }}
          >
            <div className="absolute inset-0 bg-white/10 rounded-full"></div>
            <div className="absolute top-0 left-0 w-4 h-4 bg-white/20 rounded-full blur-sm"></div>
            <span className="relative z-10 text-base drop-shadow-sm">{getSymbolShortcode()}</span>
          </div>
          
          {/* Percentage Change - เพิ่มพื้นหลังและ effect */}
          {percentageChange !== 0 && (
            <div className={`flex items-center px-2.5 py-1 rounded-full ${percentageChange >= 0 ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
              {percentageChange >= 0 ? 
                <ArrowUpRight className="w-4 h-4 mr-1" /> : 
                <ArrowDownRight className="w-4 h-4 mr-1" />
              }
              <span className="text-sm font-medium">{Math.abs(percentageChange)}%</span>
            </div>
          )}
        </div>
        
        <div className="mt-auto bg-emerald-50 p-3 -mx-5 -mb-5 rounded-b-2xl border-t border-emerald-100">
          <p className="text-gray-500 text-xs mb-1">{symbol}</p>
          <div className="flex justify-between items-baseline">
            <p className="font-bold text-lg">{symbol.includes('BTC') ? '26.46' : symbol.includes('ETH') ? '37.30' : getValueDisplay()}</p>
            <p className="text-gray-500 text-xs">บาท/100 ก.ก.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
