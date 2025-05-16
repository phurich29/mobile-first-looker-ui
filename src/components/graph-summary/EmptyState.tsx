
import React from "react";
import { BarChart2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onOpenSelector: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onOpenSelector }) => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center max-w-md">
        <BarChart2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-medium mb-2 text-gray-700 dark:text-gray-300">ไม่มีข้อมูลที่เลือก</h3>
        <p className="text-gray-500 mb-4">
          คลิกที่ปุ่ม "Add Graph" เพื่อเลือกอุปกรณ์และค่าที่ต้องการแสดงบนกราฟ
        </p>
        <Button 
          onClick={onOpenSelector}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Graph
        </Button>
      </div>
    </div>
  );
};
