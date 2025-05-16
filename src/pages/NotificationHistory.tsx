
import React from "react";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { NotificationDebugger } from "@/components/notification-history/components/NotificationDebugger";

const NotificationHistory: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Header />
      
      <main className={`flex-1 p-4 ${isMobile ? 'pb-32' : 'ml-64'} overflow-x-hidden`}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">ประวัติการแจ้งเตือน</h1>
            <p className="text-gray-600">
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
