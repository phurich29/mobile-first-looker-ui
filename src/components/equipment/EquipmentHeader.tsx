
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface EquipmentHeaderProps {
  totalUniqueDevices: number;
  isRefreshing: boolean;
  isSuperAdmin: boolean;
  onRefresh: () => void;
}

export function EquipmentHeader({
  totalUniqueDevices,
  isRefreshing,
  isSuperAdmin,
  onRefresh
}: EquipmentHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>อุปกรณ์</h1>
        {isSuperAdmin && totalUniqueDevices > 0 && (
          <p className="text-xs text-gray-500 mt-1">จำนวนอุปกรณ์ทั้งหมดในระบบ: {totalUniqueDevices} เครื่อง</p>
        )}
        {!isSuperAdmin && (
          <p className="text-xs text-gray-500 mt-1">แสดงเฉพาะอุปกรณ์ที่คุณได้รับสิทธิ์การเข้าถึง</p>
        )}
      </div>
      <Button 
        variant="outline" 
        size="sm"
        className="flex items-center gap-1 border-emerald-200 bg-white hover:bg-emerald-50"
        onClick={onRefresh} 
        disabled={isRefreshing}
      >
        <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
        <span className="text-xs">รีเฟรช</span>
      </Button>
    </div>
  );
}
