
import React from "react";
import { Bell } from "lucide-react";

interface NotificationAlertProps {
  isAlertActive: boolean;
}

const NotificationAlert: React.FC<NotificationAlertProps> = ({ isAlertActive }) => {
  if (!isAlertActive) {
    return null;
  }
  
  return (
    <div className="absolute top-1/2 right-1/4 transform -translate-y-1/2 z-20 bell-animation">
      <Bell size={18} className="text-yellow-400 fill-yellow-400" />
    </div>
  );
};

export default NotificationAlert;
