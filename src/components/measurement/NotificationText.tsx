
import React from "react";
import { useTranslation } from "@/hooks/useTranslation";

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
  const { t } = useTranslation();
  
  if (!enabled || !notificationType) return null;
  
  return (
    <div className="text-[10px] text-orange-600 font-medium ml-1">
      {notificationType === 'min' ? `${t('mainMenu', 'alertWhenLowerThanSimple')} ${threshold}%` : 
       notificationType === 'max' ? `${t('mainMenu', 'alertWhenHigherThanSimple')} ${threshold}%` : 
       `${t('mainMenu', 'alertWhenOutsideRange')} ${threshold}%`}
    </div>
  );
};
