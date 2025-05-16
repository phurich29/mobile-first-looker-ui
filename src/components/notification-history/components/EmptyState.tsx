
import React from "react";
import { Bell } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow-sm">
      <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
        <Bell className="h-6 w-6 text-gray-400" />
      </div>
      <h3 className="mt-4 text-lg font-medium text-gray-900">ไม่พบประวัติการแจ้งเตือน</h3>
      <p className="mt-1 text-sm text-gray-500 text-center max-w-sm">
        ยังไม่มีประวัติการแจ้งเตือนในระบบ หรือการแจ้งเตือนทั้งหมดถูกลบไปแล้ว
      </p>
    </div>
  );
}
