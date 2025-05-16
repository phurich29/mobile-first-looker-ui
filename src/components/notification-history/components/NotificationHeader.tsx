
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Bell } from "lucide-react";

interface NotificationHeaderProps {
  totalCount: number;
  handleManualCheck: () => Promise<void>;
  handleRefresh: () => void;
  isCheckingNotifications: boolean;
  isFetching: boolean;
}

export function NotificationHeader({
  totalCount,
  handleManualCheck,
  handleRefresh,
  isCheckingNotifications,
  isFetching,
}: NotificationHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-lg font-semibold">ประวัติการแจ้งเตือน ({totalCount})</h2>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={handleManualCheck}
          className="flex items-center gap-1"
          size="sm"
          disabled={isFetching || isCheckingNotifications}
        >
          <Bell className={`h-4 w-4 ${isCheckingNotifications ? 'animate-pulse' : ''}`} />
          <span>ตรวจสอบการแจ้งเตือน</span>
        </Button>
        <Button 
          variant="outline" 
          onClick={handleRefresh} 
          className="flex items-center gap-1"
          size="sm"
          disabled={isFetching}
        >
          <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          <span>รีเฟรช</span>
        </Button>
      </div>
    </div>
  );
}
