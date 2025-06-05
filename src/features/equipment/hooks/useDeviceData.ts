
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { DeviceInfo } from "../types";
import { fetchDevicesWithDetails, countUniqueDevices } from "../services";

export function useDeviceData() {
  const { user, userRoles } = useAuth();
  const { toast } = useToast();
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalUniqueDevices, setTotalUniqueDevices] = useState(0);
  
  const isAdmin = userRoles.includes('admin');
  const isSuperAdmin = userRoles.includes('superadmin');
  
  // Fetch devices using the new optimized function
  const fetchDevices = useCallback(async () => {
    if (!user) {
      setDevices([]);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsRefreshing(true);
      
      console.log('Fetching devices using optimized database function...');
      
      // Use the new single-query function
      const deviceList = await fetchDevicesWithDetails(
        user.id,
        isAdmin,
        isSuperAdmin
      );
      
      console.log(`Fetched ${deviceList.length} devices in single query`);
      setDevices(deviceList);
      
      // Count total unique devices
      const totalCount = await countUniqueDevices();
      setTotalUniqueDevices(totalCount);
      
    } catch (error) {
      console.error('Error fetching devices:', error);
      toast({
        title: "Error",
        description: "ไม่สามารถดึงข้อมูลอุปกรณ์ได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user, isAdmin, isSuperAdmin, toast]);
  
  // Initial fetch
  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);
  
  // Handler for manual refresh
  const handleRefresh = useCallback(async () => {
    await fetchDevices();
  }, [fetchDevices]);
  
  return {
    devices,
    isLoading,
    isRefreshing,
    totalUniqueDevices,
    handleRefresh,
    isAdmin,
    isSuperAdmin
  };
}
