
import React, { useState } from "react";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import NotificationHistoryList from "@/components/notification-history/NotificationHistoryList";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { NotificationDebugger } from "@/components/notification-history/components/NotificationDebugger";

const NotificationHistory: React.FC = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<string>("list");

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className={`flex-1 p-4 ${isMobile ? 'pb-32' : 'ml-64'}`}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">ประวัติการแจ้งเตือน</h1>
            <p className="text-gray-600">
              แสดงประวัติการแจ้งเตือนที่เกิดจากการตรวจพบค่าที่เกินเกณฑ์ที่กำหนดไว้
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="list">การแสดงผลปกติ</TabsTrigger>
              <TabsTrigger value="debug">ข้อมูลดิบ (Debug)</TabsTrigger>
            </TabsList>
            
            <TabsContent value="list" className="mt-0">
              <NotificationHistoryList />
            </TabsContent>
            
            <TabsContent value="debug" className="mt-0">
              <NotificationDebugger />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <FooterNav />
    </div>
  );
};

export default NotificationHistory;
