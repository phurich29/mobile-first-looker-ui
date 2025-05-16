
import React from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="h-16 w-16 rounded-full bg-amber-50 flex items-center justify-center mb-2">
        <Bell className="h-8 w-8 text-amber-400" />
      </div>
      <h3 className="mt-4 text-lg font-medium text-gray-900">ไม่พบประวัติการแจ้งเตือน</h3>
      <p className="mt-1 text-sm text-gray-500 text-center max-w-sm mb-6">
        ยังไม่มีประวัติการแจ้งเตือนในระบบ หรือการแจ้งเตือนทั้งหมดถูกลบไปแล้ว
      </p>
      <Button 
        variant="outline" 
        size="sm"
        className="border-amber-200 text-amber-600 hover:bg-amber-50"
      >
        <Bell className="h-4 w-4 mr-2" />
        ตั้งค่าการแจ้งเตือน
      </Button>
    </div>
  );
}
