
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Bell, Search } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

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
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-emerald-200/50 dark:border-gray-700/50 rounded-lg p-3 sm:p-4 shadow-sm gap-3 sm:gap-0">
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full shadow-md flex-shrink-0">
          <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 truncate">
            {t('notificationHistory', 'notifications')}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
            {t('notificationHistory', 'total')} {totalCount} {t('notificationHistory', 'items')}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={handleManualCheck}
          disabled={isCheckingNotifications}
          className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-700 dark:hover:bg-emerald-900/20 text-xs sm:text-sm px-2 sm:px-3"
        >
          {isCheckingNotifications ? (
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-1 sm:mr-2" />
          ) : (
            <Search className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          )}
          <span className="hidden sm:inline">{t('notificationHistory', 'check')}</span>
          <span className="sm:hidden">{t('notificationHistory', 'checkShort')}</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isFetching}
          className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-700 dark:hover:bg-emerald-900/20 text-xs sm:text-sm px-2 sm:px-3"
        >
          {isFetching ? (
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-1 sm:mr-2" />
          ) : (
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          )}
          <span className="hidden sm:inline">{t('notificationHistory', 'refresh')}</span>
          <span className="sm:hidden">{t('notificationHistory', 'refreshShort')}</span>
        </Button>
      </div>
    </div>
  );
}
