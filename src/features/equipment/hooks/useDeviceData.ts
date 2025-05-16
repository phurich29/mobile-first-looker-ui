
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { DeviceInfo } from "../types";
import { 
  fetchSuperAdminDevices, 
  fetchUserDevices, 
  countUniqueDevices, 
  REQUIRED_DEVICE_CODES 
} from "../services/deviceDataService";

export function useDeviceData() {
  const [totalUniqueDevices, setTotalUniqueDevices] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const { toast } = useToast();
  const { user, userRoles } = useAuth();
  
  const isAdmin = userRoles.includes('admin') || userRoles.includes('superadmin');
  const isSuperAdmin = userRoles.includes('superadmin');

  // Function to fetch ALL device data including required devices
  const fetchAllDevices = useCallback(async () => {
    try {
      if (!user) return [];

      console.log('Fetching devices...');
      
      // Always include these specific devices in the result
      const requiredDevices = [...REQUIRED_DEVICE_CODES];
      console.log('Required devices:', requiredDevices);
      
      // Fetch devices based on user role
      if (isSuperAdmin) {
        return await fetchSuperAdminDevices();
      } else {
        return await fetchUserDevices(user.id, isAdmin);
      }
    } catch (error) {
      console.error("Error in fetchAllDevices:", error);
      // Return required devices even if there's an error
      return REQUIRED_DEVICE_CODES.map(code => ({
        device_code: code,
        updated_at: null
      }));
    }
  }, [user, userRoles, isSuperAdmin, isAdmin]);

  // Count total unique devices (for superadmin only)
  const getUniqueDevicesCount = useCallback(async () => {
    try {
      if (!user || !isSuperAdmin) return 0;
      return await countUniqueDevices();
    } catch (error) {
      console.error("Unexpected error counting devices:", error);
      return 0;
    }
  }, [user, isSuperAdmin]);

  // Use React Query for data fetching
  const { 
    data: deviceData,
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['devices', user?.id, userRoles],
    queryFn: fetchAllDevices,
    enabled: !!user,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Handle refresh - Using comprehensive approach to ensure all devices are fetched
  const handleRefresh = async () => {
    try {
      console.log("Refreshing device data...");
      setIsRefreshing(true);
      
      await refetch();
      
      toast({
        title: "อัพเดทข้อมูลสำเร็จ",
        description: (deviceData && deviceData.length > 0)
          ? `พบ ${deviceData.length} อุปกรณ์ที่คุณมีสิทธิ์เข้าถึง` 
          : "ไม่พบอุปกรณ์ที่คุณมีสิทธิ์เข้าถึง",
      });
      
      // For superadmin, update the total count too
      if (isSuperAdmin) {
        const count = await getUniqueDevicesCount();
        setTotalUniqueDevices(count);
      }
    } catch (error) {
      console.error("Refresh error:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัพเดทข้อมูลได้",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initial fetch of total count (for superadmin only)
  useEffect(() => {
    if (user && isSuperAdmin) {
      getUniqueDevicesCount().then(setTotalUniqueDevices);
    }
  }, [user, isSuperAdmin, getUniqueDevicesCount]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      console.error('Device query error:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลอุปกรณ์ได้",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  return {
    devices: deviceData || [],
    isLoading,
    error,
    isRefreshing,
    totalUniqueDevices,
    handleRefresh,
    isAdmin,
    isSuperAdmin
  };
}
