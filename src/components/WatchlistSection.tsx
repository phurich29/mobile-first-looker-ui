
import React, { useState, useEffect } from "react";
import { MeasurementItem } from "@/components/MeasurementItem";
import { useAuth } from "@/components/AuthProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { fetchNotifications, Notification } from "./sharedNotificationData";
import { Link } from "react-router-dom";
import { NotificationSetting } from "@/pages/notification-settings/types";

// ใช้ interface Notification จากไฟล์ sharedNotificationData.ts

export const WatchlistSection = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  const [watchlistItems, setWatchlistItems] = useState<Notification[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);

  // ตรวจสอบว่ามีรายการแจ้งเตือนหรือไม่
  const hasNotificationItems = watchlistItems.length > 0;

  // กรองเฉพาะรายการที่เปิดใช้งาน
  const enabledItems = watchlistItems.filter(item => item.enabled);

  console.log("Enabled notification items:", enabledItems);

  useEffect(() => {
    const loadWatchlistItems = async () => {
      try {
        setLoading(true);
        
        // ใช้ฟังก์ชัน fetchNotifications จากไฟล์ sharedNotificationData.ts
        // เพื่อดึงข้อมูลจริงจากฐานข้อมูล notification_settings
        const notifications = await fetchNotifications();
        
        console.log("Loaded notification settings:", notifications);
        setWatchlistItems(notifications);
      } catch (error) {
        console.error("Error loading watchlist items:", error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดรายการแจ้งเตือนได้",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadWatchlistItems();
    
    // เพิ่ม real-time subscription เพื่ออัพเดตข้อมูลทันทีเมื่อมีการเปลี่ยนแปลง (ใช้งานเมื่อต่อ database จริง)
    // const subscription = supabase
    //   .channel('notification_changes')
    //   .on('postgres_changes', { 
    //     event: '*', 
    //     schema: 'public', 
    //     table: 'notification_settings' 
    //   }, () => {
    //     loadWatchlistItems();
    //   })
    //   .subscribe();
      
    // return () => {
    //   subscription.unsubscribe();
    // };
  }, [user, toast]);
  
  // ดึงข้อมูลการตั้งค่าการแจ้งเตือนจากฐานข้อมูล
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setSettingsLoading(true);
        
        const { data, error } = await supabase
          .from('notification_settings')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        console.log("Fetched notification settings:", data);
        setNotificationSettings(data || []);
      } catch (error) {
        console.error("Error fetching notification settings:", error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดการตั้งค่าแจ้งเตือนได้",
          variant: "destructive",
        });
      } finally {
        setSettingsLoading(false);
      }
    };
    
    fetchSettings();
  }, [toast]);
  
  // ฟังก์ชันกำหนดสีไอคอนตามประเภทของค่าที่วัด
  const getIconColor = (symbol: string) => {
    if (symbol.includes('class1')) return "#f59e0b"; // สีส้ม
    if (symbol.includes('class2')) return "#6366f1"; // สีม่วงอ่อน
    if (symbol.includes('class3')) return "#f5d90a"; // สีเหลือง
    if (symbol.includes('whiteness')) return "#7c3aed"; // สีม่วง
    return "#10b981"; // สีเขียว (ค่าเริ่มต้น)
  };

  return (
    <>
      <div className="px-[5%] mb-3 flex justify-between items-center md:px-0" style={{ width: '100%', boxSizing: 'border-box' }}>
        <h2 className="font-semibold text-gray-700">{user ? "การแจ้งเตือนที่ติดตาม" : "ตัวอย่างการแจ้งเตือน"}</h2>
        <Link to="/notifications" className="text-sm text-green-600 font-medium">
          การแจ้งเตือนที่กำหนดไว้
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-4 text-gray-500 bg-white rounded-xl shadow-sm">กำลังโหลดข้อมูล...</div>
      ) : watchlistItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-white rounded-xl shadow-sm">ยังไม่มีรายการติดตาม</div>
      ) : (
        <div className="space-y-4">
          {watchlistItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-emerald-800">
                    {item.deviceName || item.deviceCode}
                  </h3>
                  <p className="text-sm text-gray-500">{item.name}</p>
                </div>
                <Link 
                  to={`/measurement-history/${item.deviceCode}/${item.symbol}?name=${encodeURIComponent(item.name)}`}
                  className="text-xs px-2 py-1 bg-gray-200 text-black rounded-md hover:bg-gray-300 transition-colors"
                >
                  ดูรายละเอียด
                </Link>
              </div>
              
              <div className="text-sm space-y-1">
                {item.type === "max" && (
                  <p className="flex justify-between">
                    <span className="text-gray-600">แจ้งเตือน เมื่อสูงกว่า:</span>
                    <span className="font-medium text-red-600">{item.threshold}</span>
                  </p>
                )}
                {item.type === "min" && (
                  <p className="flex justify-between">
                    <span className="text-gray-600">แจ้งเตือน เมื่อต่ำกว่า:</span>
                    <span className="font-medium text-amber-600">{item.threshold}</span>
                  </p>
                )}
                {item.type === "both" && (
                  <div>
                    <p className="flex justify-between">
                      <span className="text-gray-600">แจ้งเตือนช่วง:</span>
                      <span className="font-medium text-blue-600">{item.threshold}</span>
                    </p>
                  </div>
                )}
                <p className="flex justify-between mt-2">
                  <span className="text-gray-600">ค่าปัจจุบัน:</span>
                  <span className="font-medium text-green-600">{item.currentValue || "0"}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* แสดงการตั้งค่าแจ้งเตือนจากฐานข้อมูล */}
      <div className="mt-8">
        <div className="px-[5%] mb-3 flex justify-between items-center md:px-0" style={{ width: '100%', boxSizing: 'border-box' }}>
          <h2 className="font-semibold text-gray-700">การตั้งค่าแจ้งเตือนที่กำหนดไว้</h2>
          <Link to="/notification-settings" className="text-sm text-green-600 font-medium">
            จัดการการแจ้งเตือน
          </Link>
        </div>

        {settingsLoading ? (
          <div className="text-center py-4 text-gray-500 bg-white rounded-xl shadow-sm">กำลังโหลดข้อมูล...</div>
        ) : notificationSettings.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-white rounded-xl shadow-sm">ยังไม่มีการตั้งค่าแจ้งเตือน</div>
        ) : (
          <div className="space-y-4">
            {notificationSettings.map((setting) => (
              <div key={setting.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-emerald-800">
                      {setting.device_name || setting.device_code}
                    </h3>
                    <p className="text-sm text-gray-500">{setting.rice_type_name}</p>
                  </div>
                  <Link 
                    to={`/device/${setting.device_code}`}
                    className="text-xs px-2 py-1 bg-gray-200 text-black rounded-md hover:bg-gray-300 transition-colors"
                  >
                    ดูรายละเอียด
                  </Link>
                </div>
                
                <div className="text-sm space-y-1">
                  {setting.max_enabled && (
                    <p className="flex justify-between">
                      <span className="text-gray-600">แจ้งเตือน เมื่อสูงกว่า:</span>
                      <span className="font-medium text-red-600">{setting.max_threshold}</span>
                    </p>
                  )}
                  {setting.min_enabled && (
                    <p className="flex justify-between">
                      <span className="text-gray-600">แจ้งเตือน เมื่อต่ำกว่า:</span>
                      <span className="font-medium text-amber-600">{setting.min_threshold}</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
