
import { Skeleton } from "@/components/ui/skeleton";
import { EquipmentCard } from "@/components/EquipmentCard";
import { DeviceInfo } from "@/hooks/useDeviceFetching";

interface DeviceGridProps {
  devices: DeviceInfo[];
  isLoading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export function DeviceGrid({ devices, isLoading, isAdmin, isSuperAdmin }: DeviceGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 mt-4 md:grid-cols-3 lg:grid-cols-4">
        {[...Array(8)].map((_, index) => (
          <Skeleton key={index} className="h-40" />
        ))}
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl text-center shadow-sm">
        {isSuperAdmin ? (
          <p className="text-gray-500 text-sm">ไม่พบอุปกรณ์ กรุณากดปุ่มรีเฟรชเพื่อค้นหาอุปกรณ์</p>
        ) : (
          <p className="text-gray-500 text-sm">
            คุณยังไม่ได้รับสิทธิ์ให้เข้าถึงอุปกรณ์ใดๆ กรุณาติดต่อ Super Admin เพื่อขอสิทธิ์การเข้าถึง
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 mt-4 md:grid-cols-3 lg:grid-cols-4">
      {devices.map((device) => (
        <EquipmentCard
          key={device.device_code}
          deviceCode={device.device_code}
          lastUpdated={device.updated_at}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  );
}
