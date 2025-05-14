
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { useIsMobile } from "@/hooks/use-mobile";

export default function DeviceDetails() {
  const { deviceCode } = useParams();
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64">
      <Header />
      <main className="flex-1 p-4 pb-32">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>
              อุปกรณ์: {deviceCode}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              รายละเอียดข้อมูลการวัด
            </p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl text-center shadow-sm">
          <p className="text-gray-500 text-sm">
            ข้อมูลการวัดจะแสดงที่นี่
          </p>
        </div>
      </main>

      <FooterNav />
    </div>
  );
}
