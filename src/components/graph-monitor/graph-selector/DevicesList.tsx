
import React from "react";
import { DeviceCard } from "./DeviceCard";
import { Skeleton } from "@/components/ui/skeleton";

interface DeviceInfo {
  device_code: string;
  device_name: string;
  last_updated?: Date | null;
}

interface DevicesListProps {
  devices: DeviceInfo[];
  selectedDevice: string | null;
  loading: boolean;
  onSelectDevice: (deviceCode: string) => void;
}

export const DevicesList: React.FC<DevicesListProps> = ({ 
  devices, 
  selectedDevice,
  loading, 
  onSelectDevice 
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {Array(9).fill(0).map((_, i) => (
          <div key={i} className="flex items-center p-3 mb-2">
            <Skeleton className="h-10 w-10 rounded-full mr-3" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <p className="text-center text-gray-500 py-4">
        ไม่พบอุปกรณ์ที่ตรงกับการค้นหา
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {devices.map((device) => (
        <DeviceCard
          key={device.device_code}
          device={device}
          isSelected={selectedDevice === device.device_code}
          onClick={() => onSelectDevice(device.device_code)}
        />
      ))}
    </div>
  );
};
