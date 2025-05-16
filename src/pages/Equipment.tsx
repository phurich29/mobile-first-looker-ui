
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
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64">
      <Header />
      <main className="flex-1 p-4 pb-32 md:pb-16 md:mx-auto md:max-w-5xl md:px-8 w-full">
        {/* Devices Section */}
        <DevicesHeader 
          isRefreshing={isRefreshing}
          handleRefresh={handleRefresh}
          totalUniqueDevices={totalUniqueDevices}
          isSuperAdmin={isSuperAdmin}
        />
        
        {/* Add Device Form - Only for admin and superadmin */}
        {isAdmin && (
          <div className="mb-6">
            <AddDeviceForm onDeviceAdded={handleRefresh} />
          </div>
        )}
        
        {/* Devices Grid */}
        <DevicesGrid 
          devices={devices} 
          isAdmin={isAdmin} 
          isLoading={isLoading}
          isSuperAdmin={isSuperAdmin}
        />
        
        {/* Database Table Section - Only visible to admins and superadmins */}
        {isAdmin && <DatabaseTable />}
      </main>

      <FooterNav />
    </div>
  );
}
