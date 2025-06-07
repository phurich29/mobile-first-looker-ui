
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
    <div className="flex-shrink-0 bell-gentle-blink">
      <Bell size={16} className="text-yellow-400 fill-yellow-400" />
    </div>
  );
};

export default NotificationAlert;
