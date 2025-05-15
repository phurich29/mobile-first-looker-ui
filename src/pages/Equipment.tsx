
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { AddDeviceForm } from "@/components/device-management/AddDeviceForm";
import { DatabaseTable } from "@/components/DatabaseTable";
import { useDeviceFetching } from "@/hooks/useDeviceFetching";
import { DeviceGrid } from "@/components/equipment/DeviceGrid";
import { EquipmentHeader } from "@/components/equipment/EquipmentHeader";

export default function Equipment() {
  const {
    devices: deviceData,
    totalUniqueDevices,
    isRefreshing,
    handleRefresh,
    fetchAllDevices,
    isAdmin,
    isSuperAdmin
  } = useDeviceFetching();
  
  const [devices, setDevices] = useState(deviceData);

  // Use React Query for data fetching
  const { 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['devices'],
    queryFn: fetchAllDevices,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Update devices state when data changes
  useEffect(() => {
    if (deviceData && deviceData.length > 0) {
      setDevices(deviceData);
    }
  }, [deviceData]);

  const onRefresh = async () => {
    await refetch();
    handleRefresh();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64">
      <Header />
      <main className="flex-1 p-4 pb-32 md:pb-16 md:mx-auto md:max-w-5xl md:px-8 w-full">
        {/* Header Section */}
        <EquipmentHeader 
          totalUniqueDevices={totalUniqueDevices}
          isRefreshing={isRefreshing}
          isSuperAdmin={isSuperAdmin}
          onRefresh={onRefresh}
        />
        
        {/* Add Device Form - Only for admin and superadmin */}
        {isAdmin && (
          <div className="mb-6">
            <AddDeviceForm onDeviceAdded={handleRefresh} />
          </div>
        )}
        
        {/* Device Grid Section */}
        <DeviceGrid 
          devices={devices} 
          isLoading={isLoading} 
          isAdmin={isAdmin} 
          isSuperAdmin={isSuperAdmin} 
        />
        
        {/* Database Table Section - Only visible to admins and superadmins */}
        {isAdmin && <DatabaseTable />}
      </main>

      <FooterNav />
    </div>
  );
}
