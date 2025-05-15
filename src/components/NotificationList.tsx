
import React, { useState, useEffect } from "react";
import { NotificationItem } from "./notification/NotificationItem";
import { useAuth } from "@/components/AuthProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { fetchNotifications, Notification } from "./sharedNotificationData";

export const NotificationList = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to manually check notifications via the edge function
  const checkNotifications = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check_notifications');
      
      if (error) {
        console.error("Error checking notifications:", error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถตรวจสอบการแจ้งเตือนได้",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "ตรวจสอบการแจ้งเตือนสำเร็จ",
        variant: "update",
      });
      
      // Reload notifications after checking
      loadNotifications();
    } catch (error) {
      console.error("Error invoking check_notifications function:", error);
    }
  };

  // Load notifications from database
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const notificationData = await fetchNotifications();
      console.log("Loaded notifications:", notificationData);
      setNotifications(notificationData);
    } catch (error) {
      console.error("Error loading notifications:", error);
      setTimeout(() => {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดรายการการแจ้งเตือนได้",
          variant: "destructive",
        });
      }, 0);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and setup auto-refresh
  useEffect(() => {
    loadNotifications();
    
    // Auto-refresh every 30 seconds
    const intervalId = setInterval(loadNotifications, 30000);
    return () => clearInterval(intervalId);
  }, [user, toast]);
  
  if (loading) {
    return <div className="text-center py-4">กำลังโหลดข้อมูล...</div>;
  }
  
  return (
    <>
      <div className="px-[5%] mb-3 flex justify-between items-center md:px-0" style={{ width: '100%', boxSizing: 'border-box' }}>
        <h2 className="font-semibold text-gray-700">
          {user ? "การแจ้งเตือนที่กำหนดไว้" : "ตัวอย่างการแจ้งเตือน"}
        </h2>
        <div className="flex items-center space-x-2">
          <button 
            onClick={checkNotifications} 
            className="text-xs text-blue-600 font-medium hover:underline"
          >
            ตรวจสอบแจ้งเตือน
          </button>
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
