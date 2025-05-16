
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Bell } from "lucide-react";

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
  isFetching
}: NotificationHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-white rounded-lg shadow-sm mb-4">
      <div className="flex items-center mb-3 md:mb-0">
        <Bell className="h-5 w-5 text-emerald-600 mr-2" />
        <h2 className="text-lg font-medium text-gray-800">ประวัติการแจ้งเตือน</h2>
        <span className="ml-2 bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {totalCount} รายการ
        </span>
      </div>
      
      <div className="flex space-x-2 w-full md:w-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isFetching}
          className="text-xs border-gray-200 text-gray-700"
        >
          <RefreshCw 
            className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? 'animate-spin' : ''}`} 
          />
          รีเฟรช
        </Button>
        
        <Button
          variant="default"
          size="sm"
          onClick={handleManualCheck}
          disabled={isCheckingNotifications}
          className="text-xs bg-emerald-600 hover:bg-emerald-700 ml-auto md:ml-0"
        >
          <RefreshCw 
            className={`h-3.5 w-3.5 mr-1.5 ${isCheckingNotifications ? 'animate-spin' : ''}`} 
          />
          ตรวจสอบแจ้งเตือนใหม่
        </Button>
      </div>
    </div>
  );
}
