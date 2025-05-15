import React from "react";
import { NotificationItem } from "./notification/NotificationItem";
import { useAuth } from "@/components/AuthProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNotifications } from "@/hooks/useNotifications";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export const NotificationList = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { 
    notifications, 
    loading, 
    lastRefreshTime,
    fetchNotifications,
    checkNotifications 
  } = useNotifications();

  // Initialize data on component mount
  React.useEffect(() => {
    fetchNotifications();
    
    // Auto-refresh every 45 seconds instead of 30
    // This reduces unnecessary API calls while keeping data relatively fresh
    const intervalId = setInterval(fetchNotifications, 45000);
    return () => clearInterval(intervalId);
  }, []);
  
  const formatRefreshTime = () => {
    const hours = lastRefreshTime.getHours().toString().padStart(2, '0');
    const minutes = lastRefreshTime.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  
  if (loading && notifications.length === 0) {
    return (
      <div className="text-center py-4 flex flex-col items-center">
        <div className="animate-spin mb-2">
          <RefreshCw size={20} className="text-gray-400" />
        </div>
        <span className="text-gray-500">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }
  
  return (
    <>
      <div className="px-[5%] mb-3 flex justify-between items-center md:px-0" style={{ width: '100%', boxSizing: 'border-box' }}>
        <div>
          <h2 className="font-semibold text-gray-700">
            {user ? "การแจ้งเตือนที่กำหนดไว้" : "ตัวอย่างการแจ้งเตือน"}
          </h2>
          <p className="text-xs text-gray-500">
            อัพเดทล่าสุด: {formatRefreshTime()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={checkNotifications} 
            variant="ghost"
            size="sm"
            className="text-xs text-blue-600 font-medium hover:bg-blue-50 flex items-center"
          >
            <RefreshCw size={12} className="mr-1" />
            ตรวจสอบแจ้งเตือน
          </Button>
          <a href="/notifications" className="text-xs text-green-600 font-medium">ตั้งค่าแจ้งเตือน</a>
        </div>
      </div>

      <div className={`bg-white ${!isMobile && 'rounded-xl shadow-sm'}`}>
        {notifications.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
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
