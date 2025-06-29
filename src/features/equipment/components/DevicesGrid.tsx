
import { DeviceInfo } from "../types";
import { EquipmentCard } from "./EquipmentCard";
import { Skeleton } from "@/components/ui/skeleton";

interface DevicesGridProps {
  devices: DeviceInfo[];
  isLoading: boolean;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  onDeviceUpdated?: () => void;
}

export function DevicesGrid({ 
  devices, 
  isLoading, 
  isAdmin = false,
  isSuperAdmin = false,
  onDeviceUpdated
}: DevicesGridProps) {
  // If loading, show skeleton cards
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-lg" />
        ))}
      </div>
    );
  }

  // If no devices, show message
  if (!devices || devices.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">ไม่พบอุปกรณ์ที่คุณมีสิทธิ์เข้าถึง</p>
      </div>
    );
  }

  // Show devices grid
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {devices.map((device) => (
        <EquipmentCard
          key={device.device_code}
          deviceCode={device.device_code}
          lastUpdated={device.updated_at}
          displayName={device.display_name}
          isAdmin={isAdmin}
          isSuperAdmin={isSuperAdmin}
          onDeviceUpdated={onDeviceUpdated}
        />
      ))}
    </div>
  );
}
