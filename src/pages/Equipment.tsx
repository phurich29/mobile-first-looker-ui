
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { AddDeviceForm } from "@/components/device-management/AddDeviceForm";
import { DatabaseTable } from "@/components/DatabaseTable";
import { useDeviceData, DevicesHeader, DevicesGrid } from "@/features/equipment";

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

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 dark:from-gray-900 dark:to-gray-950 overflow-x-hidden md:ml-64">
      <Header />
      <main className="flex-1 p-4 pb-32 md:pb-16 md:mx-auto md:max-w-5xl md:px-8 w-full">
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
          <div className="absolute -bottom-1 left-0 w-16 h-1 bg-emerald-500 rounded-full"></div>
        </div>
        
        {/* Add Device Form - Only for admin and superadmin */}
        {isAdmin && (
          <div className="mb-8 bg-white/70 dark:bg-gray-800/40 p-5 rounded-xl border border-gray-100 dark:border-gray-800/30 shadow-md backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-emerald-800 dark:text-emerald-400 mb-4">เพิ่มอุปกรณ์ใหม่</h2>
            <AddDeviceForm onDeviceAdded={handleRefresh} />
          </div>
        )}
        
        {/* Devices Grid */}
        <div className="mb-8 bg-white/70 dark:bg-gray-800/40 p-5 rounded-xl border border-gray-100 dark:border-gray-800/30 shadow-md backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-emerald-800 dark:text-emerald-400 mb-4">อุปกรณ์ทั้งหมด</h2>
          <DevicesGrid 
            devices={devices} 
            isAdmin={isAdmin} 
            isLoading={isLoading}
            isSuperAdmin={isSuperAdmin}
            onDeviceUpdated={handleRefresh}
          />
        </div>
        
        {/* Database Table Section - Only visible to admins and superadmins */}
        {isAdmin && (
          <div className="mb-8 bg-white/70 dark:bg-gray-800/40 p-5 rounded-xl border border-gray-100 dark:border-gray-800/30 shadow-md backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-emerald-800 dark:text-emerald-400 mb-4">ข้อมูลฐานข้อมูล</h2>
            <DatabaseTable />
          </div>
        )}
      </main>

      <FooterNav />
    </div>
  );
}
