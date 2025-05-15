
import React from 'react';
import { Wheat, Circle, Blend } from "lucide-react";

type HistoryHeaderProps = {
  symbol: string;
  name: string;
  historyData: any[] | undefined;
  isLoading: boolean;
};

const HistoryHeader: React.FC<HistoryHeaderProps> = ({ 
  symbol, 
  name, 
  historyData, 
  isLoading 
}) => {
  // Get appropriate icon based on data type
  const getIcon = () => {
    // For "ส่วนผสม"
    if (symbol === 'whole_kernels' ||
        symbol === 'head_rice' ||
        symbol === 'total_brokens' ||
        symbol === 'small_brokens' ||
        symbol === 'small_brokens_c1') {
      return <Blend className="h-6 w-6 text-white" />;
    }
    
    // For "สิ่งเจือปน"
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
      return <Circle className="h-6 w-6 text-white" />;
    }
    
    // For rice types
    if (symbol.includes('class') || 
        symbol === 'short_grain' || 
        symbol === 'slender_kernel' ||
        symbol.includes('ข้าว')) {
      return <Wheat className="h-6 w-6 text-white" />;
    }
    
    return <Wheat className="h-6 w-6 text-white" />; // Default icon
  };

  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 shadow-sm bg-emerald-600">
          {getIcon()}
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-800">{name}</h2>
          <div className="flex items-center">
            <p className="text-xs text-gray-500 mr-2">รหัส: {symbol}</p>
            <p className="text-sm font-semibold text-emerald-600">
              {!isLoading && historyData && historyData.length > 0 ? 
                `ค่าล่าสุด: ${(historyData[0] as any)[symbol]}%` : 
                'ค่าล่าสุด: 0%'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryHeader;
