
import React from "react";
import { getNotificationIconColor, getNotificationIconName } from "./notification-utils";
import { Wheat, ArrowDown, ArrowUp, GaugeCircle, BellOff } from "lucide-react";

interface NotificationIconProps {
  symbol: string;
  name: string;
  type: 'min' | 'max' | 'both';
  enabled: boolean;
}

const NotificationIcon: React.FC<NotificationIconProps> = ({ symbol, name, type, enabled }) => {
  const iconColor = getNotificationIconColor(type);
  const iconName = getNotificationIconName(symbol, name, type, enabled);
  
  const renderIcon = () => {
    switch (iconName) {
      case "bell-off":
        return <BellOff className="w-5 h-5 text-white" />;
      case "wheat":
        return <Wheat className="w-5 h-5 text-white" />;
      case "arrow-down":
        return <ArrowDown className="w-5 h-5 text-white" />;
      case "arrow-up":
        return <ArrowUp className="w-5 h-5 text-white" />;
      case "gauge-circle":
        return <GaugeCircle className="w-5 h-5 text-white" />;
      default:
        return <GaugeCircle className="w-5 h-5 text-white" />;
    }
  };
  
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
        {renderIcon()}
      </div>
    </div>
  );
};

export default NotificationIcon;
