
import React from 'react';
import { EquipmentCard } from "@/components/EquipmentCard";
import { DeviceInfo } from "../hooks/useDeviceData";

interface DevicesGridProps {
  devices: DeviceInfo[];
  isAdmin: boolean;
  isLoading: boolean;
  isSuperAdmin: boolean;
}

export function DevicesGrid({ 
  devices, 
  isAdmin, 
  isLoading 
}: DevicesGridProps) {
  
  if (devices.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl text-center shadow-sm">
        {isLoading ? (
          <p className="text-gray-500 text-sm">กำลังดึงข้อมูลอุปกรณ์...</p>
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
