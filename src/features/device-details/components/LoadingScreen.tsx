
import React from "react";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";

export const LoadingScreen: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64">
      <Header />
      <main className="flex-1 flex justify-center items-center">
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูลอุปกรณ์ล่าสุด...</p>
        </div>
      </main>
      <FooterNav />
    </div>
  );
};
