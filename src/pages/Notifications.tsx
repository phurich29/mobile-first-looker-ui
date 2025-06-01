
import React from "react"; // Removed useEffect, useState as they are not used
import { AppLayout } from "@/components/layouts/app-layout"; // Import AppLayout
// Header and FooterNav are handled by AppLayout
import { NotificationList } from "@/components/NotificationList";
import { useAuth } from "@/components/AuthProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Clock, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

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
