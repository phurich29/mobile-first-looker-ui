
import React from "react";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { NotificationDebugger } from "@/components/notification-history/components/NotificationDebugger";
import { BackgroundImage } from "@/components/graph-monitor/BackgroundImage";
import { cn } from "@/lib/utils";

const NotificationHistory: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden dark:bg-zinc-900">
      <BackgroundImage />
      <Header />
      
      <main className={cn("flex-1 relative z-10 overflow-x-hidden", isMobile ? 'pb-32' : 'md:ml-64')}>
        <div className="mx-auto max-w-7xl p-4">
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
      </main>
      
      <FooterNav />
    </div>
  );
};

export default NotificationHistory;
