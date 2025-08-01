
import React from "react";
import { NotificationItem } from "./notification/NotificationItem";
import { useAuth } from "@/components/AuthProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNotifications } from "@/hooks/useNotifications";
import { RefreshCw, Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import NotificationButton from './NotificationButton';

export const NotificationList = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { 
    notifications, 
    loading, 
    isFetching,
    lastRefreshTime,
    checkNotifications,
    isCheckingNotifications
  } = useNotifications();

  const formatRefreshTime = () => {
    if (!lastRefreshTime || lastRefreshTime === 0) { // dataUpdatedAt can be 0 if no data yet
      return "กำลังโหลด...";
    }
    const date = new Date(lastRefreshTime);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };
  
  // Render skeleton loaders when loading
  const renderSkeletons = () => (
    <div className="space-y-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center justify-between py-3 px-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-start space-x-3 w-[60%]">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <div className="w-[38%] flex justify-end">
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
  
  const handleCheckNotifications = async () => {
    const result = await checkNotifications();
    // No need to show explicit message here as the checkNotifications function 
    // in useNotifications.ts now handles the toast notifications
  };

  const handleNavigateToSettings = () => {
    navigate('/notifications');
  };
  
  return (
    <>
      <div className="px-[5%] mb-3 flex justify-between items-center md:px-0" style={{ width: '100%', boxSizing: 'border-box' }}>
        <div>
          <h2 className="font-semibold text-gray-700 dark:text-white">
            {user ? "การแจ้งเตือนที่กำหนดไว้" : "ตัวอย่างการแจ้งเตือน"}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-300 flex items-center">
            อัพเดทล่าสุด: {formatRefreshTime()}
            {isFetching && !loading && (
              <span className="ml-2 inline-block animate-spin">
                <RefreshCw size={10} className="text-gray-400" />
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={handleCheckNotifications} 
            variant="ghost"
            size={isMobile ? "icon" : "sm"}
            className={isMobile ? "text-blue-600 hover:bg-blue-50" : "text-xs text-blue-600 font-medium hover:bg-blue-50 flex items-center"}
            disabled={isCheckingNotifications}
            title="ตรวจสอบแจ้งเตือน"
          >
            <RefreshCw 
              size={isMobile ? 16 : 12} 
              className={`${isCheckingNotifications ? 'animate-spin' : ''} ${!isMobile && 'mr-1'}`} 
            />
            {!isMobile && "ตรวจสอบแจ้งเตือน"}
          </Button>
          
          <Button
            asChild
            variant="ghost"
            size={isMobile ? "icon" : "sm"}
            className={isMobile ? "text-green-600 hover:bg-green-50" : "text-xs text-green-600 font-medium hover:bg-green-50"}
            title="ตั้งค่าแจ้งเตือน"
          >
            <a href="/notifications">
              {isMobile ? <Settings size={16} /> : "ตั้งค่าแจ้งเตือน"}
            </a>
          </Button>
        </div>
      </div>

      <NotificationButton userId={user?.id} />

      <div 
        className={`bg-white dark:bg-gray-800 ${!isMobile && 'rounded-xl border border-gray-200 dark:border-gray-600'} cursor-pointer`} 
        onClick={handleNavigateToSettings}
      >
        {loading ? (
          renderSkeletons()
        ) : notifications.length === 0 ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            ยังไม่มีการแจ้งเตือนที่กำหนดไว้
          </div>
        ) : (
          notifications.map((item) => (
            <NotificationItem
              key={item.id}
              symbol={item.symbol}
              name={item.name}
              deviceCode={item.deviceCode}
              deviceName={item.deviceName}
              threshold={item.threshold}
              enabled={item.enabled}
              type={item.type}
              updatedAt={item.updatedAt}
            />
          ))
        )}
      </div>
    </>
  );
};

