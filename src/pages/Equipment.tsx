
import { AddDeviceForm } from "@/components/device-management/AddDeviceForm";
import { DatabaseTable } from "@/components/DatabaseTable";
import { useDeviceData, DevicesHeader, DevicesGrid } from "@/features/equipment";
import { AppLayout } from "@/components/layouts";
import { DeviceHistoryTable } from "@/features/device-details/components/DeviceHistoryTable";
import { useGuestMode } from "@/hooks/useGuestMode";

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

  const { isGuest } = useGuestMode();

  return (
    <AppLayout wideContent showFooterNav contentPaddingBottom="pb-32 md:pb-16">
      {/* Background decorative elements */}
      <div className="absolute top-40 right-12 w-48 h-48 bg-emerald-300 rounded-full filter blur-3xl opacity-10 -z-10"></div>
      <div className="absolute bottom-40 left-12 w-56 h-56 bg-blue-400 rounded-full filter blur-3xl opacity-10 -z-10"></div>
          {/* Devices Section Header */}
          <div className="mb-8 relative">
            <DevicesHeader 
              isRefreshing={isRefreshing}
              handleRefresh={handleRefresh}
              totalUniqueDevices={totalUniqueDevices}
              isSuperAdmin={isSuperAdmin}
            />
          </div>
          
          {/* Add Device Form - Only for superadmin (not guests and not regular admins) */}
          {isSuperAdmin && !isGuest && (
            <div className="mb-8 bg-white/70 dark:bg-gray-800/40 p-5 rounded-xl border border-gray-100 dark:border-gray-800/30 shadow-md backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-emerald-800 dark:text-emerald-400 mb-4">เพิ่มอุปกรณ์ใหม่</h2>
              <AddDeviceForm onDeviceAdded={handleRefresh} />
            </div>
          )}
          
          {/* Devices Grid - Show for both authenticated users and guests */}
          <DevicesGrid 
            devices={devices} 
            isAdmin={isAdmin && !isGuest} 
            isLoading={isLoading}
            isSuperAdmin={isSuperAdmin && !isGuest}
            onDeviceUpdated={handleRefresh}
          />

          {/* Device History Table - Show to logged-in users only (not guests) */}
          {isAdmin && !isGuest && (
            <div className="mt-8 bg-white/70 dark:bg-gray-800/40 p-5 rounded-xl border border-gray-100 dark:border-gray-800/30 shadow-md backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-emerald-800 dark:text-emerald-400 mb-4">ประวัติข้อมูลอุปกรณ์ทั้งหมด</h2>
              <DeviceHistoryTable />
            </div>
          )}
          
          {/* Database Table Section - Only visible to admins and superadmins (not guests) */}
          {isAdmin && !isGuest && (
            <div className="mb-8 bg-white/70 dark:bg-gray-800/40 p-5 rounded-xl border border-gray-100 dark:border-gray-800/30 shadow-md backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-emerald-800 dark:text-emerald-400 mb-4">ข้อมูลฐานข้อมูล</h2>
              <DatabaseTable />
            </div>
          )}
    </AppLayout>
  );
}
