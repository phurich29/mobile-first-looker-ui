
import React from "react";
import { getNotificationIconColor, getNotificationIcon } from "./notification-utils";

interface NotificationIconProps {
  symbol: string;
  name: string;
  type: 'min' | 'max' | 'both';
  enabled: boolean;
}

const NotificationIcon: React.FC<NotificationIconProps> = ({ symbol, name, type, enabled }) => {
  const iconColor = getNotificationIconColor(type);
  const icon = getNotificationIcon(symbol, name, type, enabled);
  
  return (
    <div 
      className="shrink-0 rounded-full flex items-center justify-center mr-3 shadow-sm relative overflow-hidden"
      style={{ 
        background: `linear-gradient(135deg, ${iconColor}, ${iconColor}cc)`,
        width: '40px',
        height: '40px'
      }}
    >
      <div className="absolute inset-0 bg-white/10"></div>
      <div className="absolute top-0 left-0 w-2 h-2 bg-white/30 rounded-full blur-sm"></div>
      <div className="flex items-center justify-center w-full h-full">
        {icon}
      </div>
    </div>
  );
};

export default NotificationIcon;
