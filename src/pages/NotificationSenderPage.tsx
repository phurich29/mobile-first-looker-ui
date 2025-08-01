import React from 'react';
import { NotificationSender } from '@/components/notification/NotificationSender';
import { Header } from '@/components/Header';
import { FooterNav } from '@/components/FooterNav';

export const NotificationSenderPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6 pb-20">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ส่งแจ้งเตือน Push Notification
          </h1>
          <p className="text-gray-600">
            ใช้ OneSignal ส่งแจ้งเตือนไปยังผู้ใช้ทั้งหมดที่ subscribe
          </p>
        </div>
        
        <NotificationSender />
      </main>
      
      <FooterNav />
    </div>
  );
};
