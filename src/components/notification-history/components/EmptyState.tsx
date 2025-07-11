
import React from "react";
import { Bell, Search } from "lucide-react";

export function EmptyState() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-12 text-center">
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
      </div>
      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">ไม่พบการแจ้งเตือน</h3>
      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-sm mx-auto">
        ยังไม่มีประวัติการแจ้งเตือนที่ตรงกับเงื่อนไขที่กำหนด
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 text-xs sm:text-sm text-gray-500">
        <Search className="h-4 w-4 flex-shrink-0" />
        <span className="text-center">ลองปรับเงื่อนไขการค้นหาหรือตรวจสอบการแจ้งเตือนใหม่</span>
      </div>
    </div>
  );
}
