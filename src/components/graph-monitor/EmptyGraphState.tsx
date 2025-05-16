
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EmptyGraphStateProps {
  onAddGraph: () => void;
}

export const EmptyGraphState: React.FC<EmptyGraphStateProps> = ({ onAddGraph }) => {
  return (
    <div className="bg-gray-50 border border-purple-200 rounded-lg p-8 text-center bg-opacity-90">
      <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
        <Plus className="h-8 w-8 text-purple-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-800 mb-2">ยังไม่มีกราฟที่เลือก</h3>
      <p className="text-gray-600 mb-6">คลิกปุ่ม "เพิ่มกราฟ" เพื่อเลือกอุปกรณ์และค่าที่ต้องการแสดง</p>
      <Button 
        onClick={onAddGraph}
        className="bg-purple-600 hover:bg-purple-700"
      >
        <Plus className="h-4 w-4 mr-2" />
        เพิ่มกราฟ
      </Button>
    </div>
  );
};
