
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-8 h-40 sm:h-60 text-center">
      <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-amber-500 mb-3 sm:mb-4" />
      <p className="text-gray-700 font-medium text-base sm:text-lg mb-1 sm:mb-2">ไม่พบการแจ้งเตือน</p>
      <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">คุณยังไม่มีการตั้งค่าแจ้งเตือนที่เปิดใช้งาน</p>
      <Button asChild size="sm" className="text-sm">
        <Link to="/device/default">ไปหน้าตั้งค่าแจ้งเตือน</Link>
      </Button>
    </div>
  );
};
