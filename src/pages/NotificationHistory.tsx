
import React from "react";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import NotificationHistoryList from "@/components/notification-history/NotificationHistoryList";
import { useIsMobile } from "@/hooks/use-mobile";

const NotificationHistory: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className={`flex-1 p-4 ${isMobile ? 'pb-32' : 'ml-64'}`}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">ประวัติการแจ้งเตือน</h1>
            <p className="text-gray-600">
              แสดงประวัติการแจ้งเตือนที่เกิดจากการตรวจพบค่าที่เกินเกณฑ์ที่กำหนดไว้
            </p>
          </div>
          
          <NotificationHistoryList />
        </div>
      </main>
      
      {isMobile && <FooterNav />}
    </div>
  );
};

export default NotificationHistory;
