
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 h-60 text-center">
      <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
      <p className="text-gray-700 font-medium text-lg mb-2">ไม่พบการแจ้งเตือน</p>
      <p className="text-gray-600 mb-4">คุณยังไม่มีการตั้งค่าแจ้งเตือนที่เปิดใช้งาน</p>
      <Button asChild>
        <Link to="/device/default">ไปหน้าตั้งค่าแจ้งเตือน</Link>
      </Button>
    </div>
  );
};
