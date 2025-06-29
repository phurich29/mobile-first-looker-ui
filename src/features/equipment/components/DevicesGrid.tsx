
import { EquipmentCard } from "./EquipmentCard";
import { DeviceInfo } from "../types";

interface DevicesGridProps {
  devices: DeviceInfo[];
  isAdmin: boolean;
  isLoading: boolean;
  isSuperAdmin?: boolean;
  onDeviceUpdated?: () => void;
}

export function DevicesGrid({ 
  devices, 
  isAdmin, 
  isLoading, 
  isSuperAdmin = false,
  onDeviceUpdated 
}: DevicesGridProps) {
  console.log("🏗️ DevicesGrid rendering with devices:", devices.map(d => ({
    code: d.device_code,
    hasDeviceData: !!d.deviceData,
    deviceData: d.deviceData
  })));

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">ไม่พบอุปกรณ์</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {devices.map((device) => {
        console.log(`🎯 Rendering card for ${device.device_code} with deviceData:`, device.deviceData);
        
        return (
          <EquipmentCard
            key={device.device_code}
            deviceCode={device.device_code}
            lastUpdated={device.updated_at}
            isAdmin={isAdmin}
            isSuperAdmin={isSuperAdmin}
            displayName={device.display_name}
            onDeviceUpdated={onDeviceUpdated}
            deviceData={device.deviceData}
          />
        );
      })}
    </div>
  );
}
