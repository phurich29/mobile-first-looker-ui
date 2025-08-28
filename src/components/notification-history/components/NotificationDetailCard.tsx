import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import { TrendingUp, TrendingDown, AlertTriangle, Clock } from "lucide-react";
import { Notification } from "../types";

interface NotificationDetailCardProps {
  notification: Notification;
}

export function NotificationDetailCard({ notification }: NotificationDetailCardProps) {
  // Parse settings snapshot if available
  const settingsSnapshot = notification.settings_snapshot as any;
  const thresholdValue = notification.threshold_type === 'min' 
    ? settingsSnapshot?.min_threshold 
    : settingsSnapshot?.max_threshold;
  
  const actualValue = notification.value;
  const isOverThreshold = notification.threshold_type === 'max';
  const isUnderThreshold = notification.threshold_type === 'min';

  return (
    <Card className="border-l-4 border-l-destructive">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                การแจ้งเตือน {notification.rice_type_id}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {notification.device_code}
              </p>
            </div>
          </div>
          <Badge 
            variant={isOverThreshold ? 'destructive' : 'secondary'}
            className="text-xs"
          >
            {isOverThreshold ? (
              <><TrendingUp className="w-3 h-3 mr-1" />เกินค่า</>
            ) : (
              <><TrendingDown className="w-3 h-3 mr-1" />ต่ำกว่า</>
            )}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* ข้อความแจ้งเตือน */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium text-foreground">
            {notification.notification_message}
          </p>
        </div>

        {/* การเปรียบเทียบค่า */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-secondary/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">ค่าที่ตั้งไว้</p>
            <p className="text-lg font-semibold text-secondary-foreground">
              {thresholdValue !== undefined ? thresholdValue.toFixed(2) : 'N/A'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isOverThreshold ? 'สูงสุด' : 'ต่ำสุด'}
            </p>
          </div>
          
          <div className="text-center p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">ค่าที่ได้รับจริง</p>
            <p className="text-lg font-semibold text-destructive">
              {actualValue.toFixed(2)}
            </p>
            <p className="text-xs text-destructive">
              {isOverThreshold 
                ? `เกิน +${(actualValue - (thresholdValue || 0)).toFixed(2)}`
                : `ขาด ${((thresholdValue || 0) - actualValue).toFixed(2)}`
              }
            </p>
          </div>
        </div>

        {/* ข้อมูลเพิ่มเติม */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>
              {formatDistanceToNow(new Date(notification.timestamp), { 
                addSuffix: true, 
                locale: th 
              })}
            </span>
          </div>
          
          {notification.notification_count > 1 && (
            <Badge variant="outline" className="text-xs">
              แจ้งเตือน {notification.notification_count} ครั้ง
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}