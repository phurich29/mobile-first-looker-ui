
import { useState, useMemo, useEffect } from "react";
import { EquipmentCard } from "./EquipmentCard";
import { DeviceInfo } from "../types";
import { DevicesSortDropdown, SortOption } from "./DevicesSortDropdown";
import { supabase } from "@/integrations/supabase/client";

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
  const [sortBy, setSortBy] = useState<SortOption>("device_code");

  // Get hidden devices from database for admin filtering
  const [hiddenDeviceCodes, setHiddenDeviceCodes] = useState<string[]>([]);

  useEffect(() => {
    const loadHiddenDevices = async () => {
      if (!isAdmin || isSuperAdmin) return;
      
      try {
        const { data, error } = await supabase
          .from('admin_device_visibility')
          .select('device_code')
          .eq('hidden_for_admin', true);

        if (error) {
          console.error('Error loading hidden devices:', error);
          return;
        }

        const deviceCodes = data?.map(d => d.device_code) || [];
        setHiddenDeviceCodes(deviceCodes);
        console.log("🔒 Loaded hidden device codes for admin:", deviceCodes);
      } catch (error) {
        console.error('Error loading hidden devices:', error);
      }
    };

    loadHiddenDevices();
  }, [isAdmin, isSuperAdmin]);

  // Filter out hidden devices for admin users (but not superadmin)
  const filteredDevices = useMemo(() => {
    if (!isAdmin || isSuperAdmin || hiddenDeviceCodes.length === 0) {
      return devices;
    }
    
    const filtered = devices.filter(device => !hiddenDeviceCodes.includes(device.device_code));
    console.log("🔒 Admin device filtering:", {
      total: devices.length,
      hidden: hiddenDeviceCodes,
      filtered: filtered.length,
      hiddenCount: devices.length - filtered.length
    });
    return filtered;
  }, [devices, isAdmin, isSuperAdmin, hiddenDeviceCodes]);

  console.log("🏗️ DevicesGrid rendering with devices:", filteredDevices.map(d => ({
    code: d.device_code,
    hasDeviceData: !!d.deviceData,
    deviceData: d.deviceData
  })));

  // Sort devices based on selected option
  const sortedDevices = [...filteredDevices].sort((a, b) => {
    switch (sortBy) {
      case "device_code":
        return a.device_code.localeCompare(b.device_code);
      case "display_name":
        const nameA = a.display_name || a.device_code;
        const nameB = b.display_name || b.device_code;
        return nameA.localeCompare(nameB);
      case "updated_at":
        const dateA = new Date(a.updated_at).getTime();
        const dateB = new Date(b.updated_at).getTime();
        return dateB - dateA; // Most recent first
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <div>
        <div className="mb-4 flex justify-end">
          <DevicesSortDropdown value={sortBy} onChange={setSortBy} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (filteredDevices.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          {devices.length === 0 ? "ไม่พบอุปกรณ์" : "อุปกรณ์ทั้งหมดถูกซ่อนการแสดงผล"}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <DevicesSortDropdown value={sortBy} onChange={setSortBy} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {sortedDevices.map((device) => {
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
    </div>
  );
}
