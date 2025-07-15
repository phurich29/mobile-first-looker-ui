
import React, { useEffect } from "react"; // Added useEffect
import { AppLayout } from "@/components/layouts/app-layout"; // Import AppLayout
// Header and FooterNav are handled by AppLayout
import { NotificationList } from "@/components/NotificationList";
import { useAuth } from "@/components/AuthProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Clock, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Notifications = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Auto-check notifications when entering this page
  useEffect(() => {
    const autoCheckNotifications = async () => {
      try {
        console.log("Auto-checking notifications on page load...");
        const { data, error } = await supabase.functions.invoke('check_notifications', {
          method: 'POST',
          body: { 
            timestamp: new Date().toISOString(),
            checkType: 'auto_page_load'
          }
        });

        // 1. ตรวจสอบ Error อย่างละเอียด
        if (error) {
          console.error("Error invoking Supabase function:", error);
          toast({
            variant: "destructive",
            title: "เกิดข้อผิดพลาด",
            description: "ไม่สามารถตรวจสอบการแจ้งเตือนได้ในขณะนี้",
          });
          return; // หยุดทำงานทันที
        }

        // 2. ตรวจสอบโครงสร้างข้อมูล
        if (!data || typeof data.notificationCount !== 'number') {
          console.warn("Invalid data structure from check_notifications:", data);
          return; // หยุดทำงานเพื่อป้องกันแอปเด้ง
        }

        // 3. ใช้งานข้อมูลได้อย่างปลอดภัย
        const notificationCount = data.notificationCount;
        console.log(`Auto-check completed: ${notificationCount} notifications processed`);
        
        if (notificationCount > 0) {
          toast({
            title: "การแจ้งเตือนใหม่",
            description: `พบการแจ้งเตือนใหม่/อัพเดท ${notificationCount} รายการ`,
            variant: "update",
          });
        }
      } catch (error) {
        console.error("Error during auto notification check:", error);
        // Optional: Show a generic error toast for unexpected errors during the try-catch execution
        toast({
          variant: "destructive",
          title: "เกิดข้อผิดพลาดที่ไม่คาดคิด",
          description: "มีบางอย่างผิดปกติขณะตรวจสอบการแจ้งเตือน",
        });
      }
    };

    // Only auto-check if user is authenticated
    if (user) {
      autoCheckNotifications();
    }
  }, [user, toast]);

  return (
    <AppLayout showFooterNav={true}>
      {/* Main content container with original padding and max-width. Dynamic margins/paddings are now handled by AppLayout. */}
      <div className="p-4">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">การแจ้งเตือน</h1>
              <p className="text-gray-600">
                จัดการและตรวจสอบการแจ้งเตือนสำหรับอุปกรณ์ของคุณ
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => navigate('/notification-settings')}
                className="flex items-center gap-1"
              >
                <Settings className="h-4 w-4" />
                <span>ตั้งค่าการแจ้งเตือน</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate('/notification-history')}
                className="flex items-center gap-1"
              >
                <Clock className="h-4 w-4" />
                <span>ประวัติการแจ้งเตือน</span>
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
            <NotificationList />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Notifications;
