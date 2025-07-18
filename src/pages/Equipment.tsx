
import { AddDeviceForm } from "@/components/device-management/AddDeviceForm";
import { DatabaseTable } from "@/components/DatabaseTable";
import { useDeviceData, DevicesHeader, DevicesGrid } from "@/features/equipment";
import { AppLayout } from "@/components/layouts";
import { DeviceHistoryTable } from "@/features/device-details/components/DeviceHistoryTable";
import { useGuestMode } from "@/hooks/useGuestMode";
import { useMemo } from "react";

export default function Equipment() {
  const {
    devices,
    isLoading,
    isRefreshing,
    totalUniqueDevices,
    handleRefresh,
    isAdmin,
    isSuperAdmin
  } = useDeviceData();
  const {
    isGuest
  } = useGuestMode();
  
  // Memoize deviceIds to prevent unnecessary re-renders
  const deviceIds = useMemo(() => {
    return devices.map(d => d.device_code);
  }, [devices]);
  
  return <AppLayout wideContent showFooterNav contentPaddingBottom="pb-32 md:pb-16">
      {/* Background decorative elements */}
      <div className="absolute top-40 right-12 w-48 h-48 bg-emerald-300 rounded-full filter blur-3xl opacity-10 -z-10"></div>
      <div className="absolute bottom-40 left-12 w-56 h-56 bg-blue-400 rounded-full filter blur-3xl opacity-10 -z-10"></div>
          
          {/* Devices Section Header */}
          <div className="mb-8 relative">
            <DevicesHeader isRefreshing={isRefreshing} handleRefresh={handleRefresh} totalUniqueDevices={totalUniqueDevices} isSuperAdmin={isSuperAdmin} />
          </div>
          
          {/* Add Device Form - Only for superadmin (not guests and not regular admins) */}
          {isSuperAdmin && !isGuest && <div className="mb-8 bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">เพิ่มอุปกรณ์ใหม่</h2>
              <AddDeviceForm onDeviceAdded={handleRefresh} />
            </div>}
          
          {/* Devices Grid - Show for both authenticated users and guests */}
          {/* Admin now has same permissions as SuperAdmin for viewing devices */}
          <DevicesGrid devices={devices} isAdmin={isAdmin && !isGuest} isLoading={isLoading} isSuperAdmin={isSuperAdmin && !isGuest} onDeviceUpdated={handleRefresh} />

          {/* Device History Table - Show to all users including guests */}
          <div className="mt-8 bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <DeviceHistoryTable deviceIds={deviceIds} title="ประวัติอุปกรณ์" />
          </div>
    </AppLayout>;
}
