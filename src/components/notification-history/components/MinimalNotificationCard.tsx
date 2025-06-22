
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Clock, AlertTriangle } from "lucide-react";
import { formatBangkokTime } from "@/components/measurement-history/api";
import { Notification } from "../types";
import { cn } from "@/lib/utils";

interface MinimalNotificationCardProps {
  notification: Notification;
  onViewDetails: (deviceCode: string, riceTypeId: string) => void;
}

export const MinimalNotificationCard: React.FC<MinimalNotificationCardProps> = ({
  notification,
  onViewDetails
}) => {
  const { thaiDate, thaiTime } = formatBangkokTime(notification.timestamp);
  
  const getThresholdIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'max':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'min':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getThresholdColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'max':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'min':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getValueColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'max':
        return 'text-red-600 font-semibold';
      case 'min':
        return 'text-orange-600 font-semibold';
      default:
        return 'text-gray-600 font-semibold';
    }
  };

  return (
    <Card className="p-4 hover:shadow-md transition-all duration-200 border-l-4 border-l-purple-200 bg-white">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
            {getThresholdIcon(notification.threshold_type)}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {notification.rice_type_id}
              </h3>
              <Badge 
                variant="outline" 
                className={cn("text-xs", getThresholdColor(notification.threshold_type))}
              >
                {notification.threshold_type === 'max' ? 'เกินค่าสูงสุด' : 'ต่ำกว่าค่าต่ำสุด'}
              </Badge>
            </div>
            
            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
              {notification.notification_message}
            </p>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <span className="font-mono text-gray-700">{notification.device_code}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{thaiDate} {thaiTime}</span>
              </div>
              {notification.notification_count > 1 && (
                <div className="flex items-center space-x-1">
                  <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                    {notification.notification_count} ครั้ง
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Value and Action */}
        <div className="flex-shrink-0 text-right space-y-2">
          <div className={cn("text-lg font-mono", getValueColor(notification.threshold_type))}>
            {notification.value?.toFixed(2) || 'N/A'}%
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(notification.device_code, notification.rice_type_id)}
            className="text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50"
          >
            <Eye className="h-3 w-3 mr-1" />
            ดูข้อมูล
          </Button>
        </div>
      </div>
    </Card>
  );
};
