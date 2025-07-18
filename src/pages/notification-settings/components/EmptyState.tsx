
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { useGlobalDeviceCache } from "@/features/equipment/hooks/useGlobalDeviceCache";

export const EmptyState = () => {
  const { user } = useAuth();
  const { devices: cachedDevices, isLoading } = useGlobalDeviceCache();

  const hasDeviceAccess = user && cachedDevices.length > 0;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-4 sm:p-8 h-40 sm:h-60 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-8 h-40 sm:h-60 text-center">
      <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-amber-500 mb-3 sm:mb-4" />
      <p className="text-gray-700 font-medium text-base sm:text-lg mb-1 sm:mb-2">ไม่พบการแจ้งเตือน</p>
      <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">คุณยังไม่มีการตั้งค่าแจ้งเตือนที่เปิดใช้งาน</p>
      {hasDeviceAccess && (
        <Button asChild size="sm" className="text-sm">
          <Link to="/device/default">ไปหน้าตั้งค่าแจ้งเตือน</Link>
        </Button>
      )}
    </div>
  );
};
