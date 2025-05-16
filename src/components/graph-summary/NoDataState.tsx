
import React from "react";
import { BarChart2 } from "lucide-react";

export const NoDataState: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <BarChart2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-medium mb-2 text-gray-700 dark:text-gray-300">ไม่พบข้อมูล</h3>
        <p className="text-gray-500">ไม่พบข้อมูลสำหรับค่าที่เลือกในช่วงเวลานี้</p>
      </div>
    </div>
  );
};
