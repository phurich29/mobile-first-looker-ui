
import React from "react";
import { Bell, Search } from "lucide-react";

export function EmptyState() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Bell className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบการแจ้งเตือน</h3>
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">
        ยังไม่มีประวัติการแจ้งเตือนที่ตรงกับเงื่อนไขที่กำหนด
      </p>
      <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
        <Search className="h-4 w-4" />
        <span>ลองปรับเงื่อนไขการค้นหาหรือตรวจสอบการแจ้งเตือนใหม่</span>
      </div>
    </div>
  );
}
