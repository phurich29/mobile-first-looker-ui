
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
    <div className="flex items-center justify-between bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-emerald-200/50 dark:border-gray-700/50 rounded-lg p-4 shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full shadow-md">
          <Bell className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            การแจ้งเตือน
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ทั้งหมด {totalCount} รายการ
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleManualCheck}
          disabled={isCheckingNotifications}
          className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-700 dark:hover:bg-emerald-900/20"
        >
          {isCheckingNotifications ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Search className="h-4 w-4 mr-2" />
          )}
          ตรวจสอบ
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isFetching}
          className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-700 dark:hover:bg-emerald-900/20"
        >
          {isFetching ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          รีเฟรช
        </Button>
      </div>
    </div>
  );
}
