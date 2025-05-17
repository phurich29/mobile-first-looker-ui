
import React from "react";
import { Blend, Circle, Wheat, Bot, Bell } from "lucide-react";

interface NotificationIconProps {
  symbol: string;
  iconColor: string;
  enabled?: boolean;
  isAlertActive?: boolean;
}

export const NotificationIcon: React.FC<NotificationIconProps> = ({
  symbol,
  iconColor,
  enabled = true,
  isAlertActive = false
}) => {
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

  return (
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
      {enabled && (
        <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-md">
          {isAlertActive ? (
            <Bell size={16} className="text-red-500 bell-animation" />
          ) : (
            <Bot size={16} className="text-orange-500" />
          )}
        </div>
      )}
    </div>
  );
};
