
import React from "react";
import { DeviceCard } from "./DeviceCard";
import { Loader2, SearchX } from "lucide-react";

interface DevicesListProps {
  devices: { device_code: string; display_name?: string; last_updated?: string }[];
  selectedDevice: string | null;
  loading: boolean;
  onSelectDevice: (deviceCode: string) => void;
  defaultDeviceCode?: string | null;
}

export const DevicesList: React.FC<DevicesListProps> = ({ 
  devices, 
  selectedDevice, 
  loading, 
  onSelectDevice,
  defaultDeviceCode
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 text-emerald-500 animate-spin mb-2" />
        <p className="text-muted-foreground">กำลังโหลดรายการอุปกรณ์...</p>
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <SearchX className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
        <h3 className="font-medium mb-1">ไม่พบอุปกรณ์</h3>
        <p className="text-muted-foreground text-sm">ไม่พบอุปกรณ์ที่ตรงกับคำค้นหา</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {devices.map((device) => (
        <DeviceCard
          key={device.device_code}
          deviceCode={device.device_code}
          displayName={device.display_name}
          lastUpdated={device.last_updated}
          isSelected={selectedDevice === device.device_code}
          isDefaultDevice={defaultDeviceCode === device.device_code}
          onClick={() => onSelectDevice(device.device_code)}
        />
      ))}
    </div>
  );
};
