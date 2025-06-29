
import { useIsMobile } from "@/hooks/use-mobile";
import { EquipmentCard } from "./EquipmentCard";

interface Device {
  device_code: string;
  display_name?: string;
  updated_at: string | null;
}

interface DevicesGridProps {
  devices: Device[];
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isLoading: boolean;
  onDeviceUpdated: () => void;
}

export function DevicesGrid({ 
  devices, 
  isAdmin, 
  isSuperAdmin,
  isLoading, 
  onDeviceUpdated 
}: DevicesGridProps) {
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white/70 dark:bg-gray-800/40 p-5 rounded-xl border border-gray-100 dark:border-gray-800/30 shadow-md backdrop-blur-sm animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">📱</div>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">ไม่พบอุปกรณ์</h3>
        <p className="text-gray-500 dark:text-gray-400">ยังไม่มีอุปกรณ์ที่ลงทะเบียนในระบบ</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {devices.map((device) => (
        <EquipmentCard
          key={device.device_code}
          deviceCode={device.device_code}
          displayName={device.display_name}
          lastUpdated={device.updated_at}
          isAdmin={isAdmin}
          isSuperAdmin={isSuperAdmin}
          onDeviceUpdated={onDeviceUpdated}
        />
      ))}
    </div>
  );
}
