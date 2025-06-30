import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Clock, AlertTriangle, Blend, Circle, Wheat } from "lucide-react";
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
  // Adjust timestamp by subtracting 7 hours to correct timezone issue
  const originalDate = new Date(notification.timestamp);
  originalDate.setHours(originalDate.getHours() - 7);
  const adjustedTimestamp = originalDate.toISOString();

  const {
    thaiDate,
    thaiTime
  } = formatBangkokTime(adjustedTimestamp);
  const getThresholdIcon = (type: string, symbol: string) => {
    // Get icon based on rice type symbol (same logic as NotificationIcon)
    if (symbol === 'whole_kernels' || symbol === 'head_rice' || symbol === 'total_brokens' || symbol === 'small_brokens' || symbol === 'small_brokens_c1') {
      return <Blend className="w-5 h-5 text-white" />;
    }
    if (symbol === 'red_line_rate' || symbol === 'parboiled_red_line' || symbol === 'parboiled_white_rice' || symbol === 'honey_rice' || symbol === 'yellow_rice_rate' || symbol === 'black_kernel' || symbol === 'partly_black_peck' || symbol === 'partly_black' || symbol === 'imperfection_rate' || symbol === 'sticky_rice_rate' || symbol === 'impurity_num' || symbol === 'paddy_rate' || symbol === 'whiteness' || symbol === 'process_precision') {
      return <Circle className="w-5 h-5 text-white" />;
    }
    if (symbol.includes('class') || symbol === 'short_grain' || symbol === 'slender_kernel' || symbol.includes('ข้าว')) {
      return <Wheat className="w-5 h-5 text-white" />;
    }

    // Default for threshold alerts
    return <AlertTriangle className="w-5 h-5 text-white" />;
  };
  const getIconColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'max':
        return '#ef4444';
      // red-500
      case 'min':
        return '#f97316';
      // orange-500
      default:
        return '#8b5cf6';
      // purple-500
    }
  };
  const getThresholdColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'max':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
      case 'min':
        return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };
  const getValueColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'max':
        return 'text-red-600 font-semibold dark:text-red-400';
      case 'min':
        return 'text-orange-600 font-semibold dark:text-orange-400';
      default:
        return 'text-gray-600 font-semibold dark:text-gray-400';
    }
  };
  const iconColor = getIconColor(notification.threshold_type);
  return <Card className="p-4 hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {/* Icon with same style as NotificationIcon */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-md relative overflow-hidden" style={{
            background: `linear-gradient(135deg, ${iconColor}, ${iconColor}cc)`
          }}>
              <div className="absolute inset-0 bg-white/10"></div>
              <div className="absolute top-0 left-0 w-3 h-3 bg-white/30 rounded-full blur-sm"></div>
              {getThresholdIcon(notification.threshold_type, notification.rice_type_id)}
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {notification.rice_type_id}
              </h3>
              <Badge variant="outline" className={cn("text-xs", getThresholdColor(notification.threshold_type))}>
                {notification.threshold_type === 'max' ? 'เกินค่าสูงสุด' : 'ต่ำกว่าค่าต่ำสุด'}
              </Badge>
            </div>
            
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
              {notification.notification_message}
            </p>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <span className="font-mono text-gray-700 dark:text-gray-300">{notification.device_code}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{thaiDate} {thaiTime}</span>
              </div>
              {notification.notification_count > 1 && <div className="flex items-center space-x-1">
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                    {notification.notification_count} ครั้ง
                  </span>
                </div>}
            </div>
          </div>
        </div>
        
        {/* Value and Action */}
        <div className="flex-shrink-0 text-right space-y-2">
          <div className={cn("text-lg font-mono", getValueColor(notification.threshold_type))}>
            {notification.value?.toFixed(2) || 'N/A'}%
          </div>
          <Button variant="ghost" size="sm" onClick={() => onViewDetails(notification.device_code, notification.rice_type_id)} className="text-xs hover:bg-purple-50 dark:hover:bg-purple-900/30 text-slate-950 dark:text-slate-50">
            <Eye className="h-3 w-3 mr-1" />
            ดูข้อมูล
          </Button>
        </div>
      </div>
    </Card>;
};
