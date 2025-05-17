
import React from "react";

interface NotificationTextProps {
  enabled?: boolean;
  notificationType?: 'min' | 'max' | 'both';
  threshold?: string;
}

export const NotificationText: React.FC<NotificationTextProps> = ({
  enabled = false,
  notificationType,
  threshold
}) => {
  if (!enabled || !notificationType) return null;
  
  return (
    <div className="text-[10px] text-orange-600 font-medium ml-1">
      {notificationType === 'min' ? `เตือนเมื่อต่ำกว่า ${threshold}%` : 
       notificationType === 'max' ? `เตือนเมื่อสูงกว่า ${threshold}%` : 
       `เตือนเมื่อนอกช่วง ${threshold}%`}
    </div>
  );
};
