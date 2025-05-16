
import React from "react";

export function EmptyState() {
  return (
    <div className="text-center py-8 border rounded-lg bg-gray-50">
      <p className="text-gray-500">ไม่พบประวัติการแจ้งเตือน</p>
      <p className="text-sm text-gray-400 mt-1">ยังไม่มีการแจ้งเตือนใดๆ ในระบบ</p>
    </div>
  );
}
