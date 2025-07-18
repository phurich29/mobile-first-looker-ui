
import { Button } from "@/components/ui/button";
import { RefreshCw, Settings, Users } from "lucide-react";
import { useGlobalCountdown } from "@/contexts/CountdownContext";

interface DevicesHeaderProps {
  isRefreshing: boolean;
  handleRefresh: () => void;
  totalUniqueDevices: number;
  isSuperAdmin: boolean;
}

export function DevicesHeader({ 
  isRefreshing, 
  handleRefresh, 
  totalUniqueDevices, 
  isSuperAdmin 
}: DevicesHeaderProps) {
  const { seconds, manualRefresh } = useGlobalCountdown();

  // Use manual refresh instead of automatic
  const onRefreshClick = () => {
    manualRefresh();
    handleRefresh();
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
          อุปกรณ์ทั้งหมด
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          พบอุปกรณ์ทั้งหมด {totalUniqueDevices} เครื่อง
        </p>
        <p className="text-sm text-gray-500 mt-1">
          อัพเดทอัตโนมัติในอีก {seconds} วินาที
        </p>
      </div>
      
      <div className="flex gap-2">
        <Button
          onClick={onRefreshClick}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'กำลังโหลด...' : 'รีเฟรช'}
        </Button>
      </div>
    </div>
  );
}
