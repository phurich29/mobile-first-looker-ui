import { memo } from 'react';
import { useDevices } from '../contexts/DeviceContext';
import { DeviceInfo } from '../types';

interface OptimizedDevicesGridProps {
  isAdmin: boolean;
  isSuperAdmin?: boolean;
  onDeviceUpdated?: () => void;
}

export const OptimizedDevicesGrid = memo(({ 
  isAdmin, 
  isSuperAdmin = false,
  onDeviceUpdated 
}: OptimizedDevicesGridProps) => {
  const { devices, isLoading } = useDevices();
  
  console.log("🏗️ OptimizedDevicesGrid render:", { 
    deviceCount: devices.length,
    isLoading,
    timestamp: new Date().toISOString()
  });

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Grid content */}
    </div>
  );
});
