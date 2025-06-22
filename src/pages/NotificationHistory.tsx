
import React from "react";
import { AppLayout } from "@/components/layouts/app-layout";
import { useIsMobile } from "@/hooks/use-mobile";
import { NotificationHistoryList } from "@/components/notification-history/NotificationHistoryList";
import { BackgroundImage } from "@/components/graph-monitor/BackgroundImage";
import { cn } from "@/lib/utils";

const NotificationHistory: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <AppLayout showFooterNav={true}>
      <BackgroundImage />
      <div className={cn("relative z-10")}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">ประวัติการแจ้งเตือน</h1>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
              แสดงประวัติการแจ้งเตือนที่เกิดจากการตรวจพบค่าที่เกินเกณฑ์ที่กำหนดไว้
            </p>
          </div>

          <div className="mt-0">
            <NotificationHistoryList />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default NotificationHistory;
