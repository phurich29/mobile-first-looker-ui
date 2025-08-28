
import React from "react";
import { Circle, Bot, Bell } from "lucide-react";

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
  // ใช้ไอคอนวงแหวนแบบเดียวกันเสมอ เพื่อให้สอดคล้องกับคอมโพเนนต์อื่นๆ
  const getIcon = () => {
    return <Circle className="w-5 h-5 text-white" />;
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
