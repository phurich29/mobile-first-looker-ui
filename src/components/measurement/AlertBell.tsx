
import React from "react";
import { Bell } from "lucide-react";

interface AlertBellProps {
  isAlertActive: boolean;
  enabled?: boolean;
  notificationType?: 'min' | 'max' | 'both';
}

export const AlertBell: React.FC<AlertBellProps> = ({ 
  isAlertActive, 
  enabled = false,
  notificationType
}) => {
  if (!isAlertActive || !enabled || !notificationType) return null;
  
  return (
    <div className="absolute top-1/2 right-1/4 transform -translate-y-1/2 z-20 bell-animation">
      <Bell size={18} className="text-yellow-400 fill-yellow-400" />
    </div>
  );
};
