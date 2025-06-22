
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Bell, Search } from "lucide-react";

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
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
            <Bell className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">ประวัติการแจ้งเตือน</h1>
            <p className="text-sm text-gray-600 mt-1">
              พบการแจ้งเตือนทั้งหมด <span className="font-medium text-purple-600">{totalCount}</span> รายการ
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isFetching}
            className="border-gray-200 hover:bg-gray-50"
          >
            <RefreshCw 
              className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} 
            />
            รีเฟรช
          </Button>
          
          <Button
            size="sm"
            onClick={handleManualCheck}
            disabled={isCheckingNotifications}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Search 
              className={`h-4 w-4 mr-2 ${isCheckingNotifications ? 'animate-spin' : ''}`} 
            />
            ตรวจสอบใหม่
          </Button>
        </div>
      </div>
    </div>
  );
}
