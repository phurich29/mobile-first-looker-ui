
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { NotificationBadge } from "./NotificationBadge";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import { Bell, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notification } from "../types";

interface NotificationCardProps {
  notification: Notification;
  onViewDetails: (deviceCode: string, riceTypeId: string) => void;
}

export function NotificationCard({ notification, onViewDetails }: NotificationCardProps) {
  const formattedDate = notification.timestamp
    ? formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true, locale: th })
    : "ไม่พบข้อมูลเวลา";
  
  // Format value to 2 decimal places if it's a number
  const formattedValue = typeof notification.value === 'number'
    ? notification.value.toFixed(2)
    : notification.value;

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-0">
        <div className="border-l-4 border-amber-500 bg-gradient-to-r from-amber-50 to-transparent p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center space-x-2">
              <div className="bg-amber-100 p-1.5 rounded-full">
                <Bell size={16} className="text-amber-600" />
              </div>
              <h3 className="font-medium text-gray-800">{notification.rice_type_id}</h3>
            </div>
            <NotificationBadge type={notification.threshold_type} />
          </div>
          
          <p className="text-sm text-gray-600 mb-3">
            {notification.notification_message || "ไม่พบข้อความการแจ้งเตือน"}
          </p>
          
          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">อุปกรณ์: {notification.device_code}</span>
              <div className="flex items-center mt-1">
                <span className="text-xs text-gray-500">
                  {formattedDate} • {notification.notification_count} ครั้ง
                </span>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              onClick={() => onViewDetails(notification.device_code, notification.rice_type_id)}
            >
              <ExternalLink size={14} className="mr-1" />
              <span className="text-xs">ดูข้อมูล</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
