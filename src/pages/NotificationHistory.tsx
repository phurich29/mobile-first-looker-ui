
import React from "react";
import { AppLayout } from "@/components/layouts/app-layout"; // Import AppLayout
import { useIsMobile } from "@/hooks/use-mobile"; // Retained as it's used in JSX if needed, though AppLayout handles main responsive logic
// Header and FooterNav are handled by AppLayout
import { NotificationDebugger } from "@/components/notification-history/components/NotificationDebugger";
import { BackgroundImage } from "@/components/graph-monitor/BackgroundImage";
import { cn } from "@/lib/utils";

const NotificationHistory: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <AppLayout showFooterNav={true}>
      <BackgroundImage />
      {/* Main content container with original padding and max-width. Dynamic margins/paddings are now handled by AppLayout. */}
      <div className={cn("relative z-10", /* overflow-x-hidden might be needed if content overflows */ )}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">ประวัติการแจ้งเตือน</h1>
            <p className="text-gray-600 dark:text-gray-300">
              แสดงประวัติการแจ้งเตือนที่เกิดจากการตรวจพบค่าที่เกินเกณฑ์ที่กำหนดไว้
            </p>
          </div>

          <div className="mt-0">
            <NotificationDebugger />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default NotificationHistory;
