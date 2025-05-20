
import React from "react";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";

export default function NewQualityMeasurements() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64">
      <Header />

      <main className="flex-1 p-4 pb-32">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <h1 className="text-2xl font-bold text-emerald-800 mb-4">ค่าวัดคุณภาพรูปแบบใหม่</h1>
          <p className="text-gray-600">หน้านี้อยู่ระหว่างการพัฒนา</p>
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-center text-gray-500">อยู่ระหว่างการพัฒนา กรุณากลับมาใหม่ในภายหลัง</p>
          </div>
        </div>
      </main>

      {/* Add space to prevent content from being hidden behind footer */}
      <div className="pb-32"></div>

      {/* Footer navigation */}
      <FooterNav />
    </div>
  );
}
