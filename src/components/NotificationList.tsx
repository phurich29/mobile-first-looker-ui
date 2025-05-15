import React, { useState, useEffect } from "react";
import { NotificationItem } from "./NotificationItem";
import { useAuth } from "@/components/AuthProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { fetchNotifications, Notification } from "./sharedNotificationData";

// ใช้ฟังก์ชัน fetchNotifications จากไฟล์ sharedNotificationData.ts เพื่อดึงข้อมูลจากฐานข้อมูล

export const NotificationList = () => {
  // ตรวจสอบสถานะการเข้าสู่ระบบ
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // โหลดรายการการแจ้งเตือน
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        
        // ดึงข้อมูลจริงจากฐานข้อมูล notification_settings
        const notificationData = await fetchNotifications();
        console.log("Loaded notifications:", notificationData);
        setNotifications(notificationData);
        setLoading(false);
      } catch (error) {
        console.error("Error loading notifications:", error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดรายการการแจ้งเตือนได้",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadNotifications();
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
        <a href="/notification-settings" className="text-sm text-green-600 font-medium">ตั้งค่าแจ้งเตือน</a>
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
