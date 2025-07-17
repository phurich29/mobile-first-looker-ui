
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useGuestMode } from "@/hooks/useGuestMode";
import { useToast } from "@/components/ui/use-toast";
import { DeviceInfo } from "../types";
import { useGuestDevices } from "./useGuestDevices";
import { useAuthenticatedDevices } from "./useAuthenticatedDevices";
import { useDeviceCount } from "./useDeviceCount";
import { useMountedRef } from "./useMountedRef";
import { useDeviceDataQuery } from "@/hooks/useDeviceDataQuery";

export function useDeviceData() {
  const { user, userRoles } = useAuth();
  const { isGuest } = useGuestMode();
  const { toast } = useToast();
  
  const isAdmin = userRoles.includes('admin');
  const isSuperAdmin = userRoles.includes('superadmin');

  // Use React Query for device data with fallback to legacy method
  const {
    devices: queryDevices,
    isLoading: queryLoading,
    isRefetching: queryRefetching,
    error: queryError,
    refetch: queryRefetch,
    totalUniqueDevices: queryTotalDevices,
  } = useDeviceDataQuery({
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
    refetchInterval: 60000, // 1 minute background refresh
  });

  // Legacy state for backward compatibility (will be populated from React Query)
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalUniqueDevices, setTotalUniqueDevices] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useMountedRef();

  // Sync React Query data with legacy state for backward compatibility
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    setDevices(queryDevices);
    setIsLoading(queryLoading);
    setIsRefreshing(queryRefetching);
    setTotalUniqueDevices(queryTotalDevices);
    setError(queryError?.message || null);

    // Show error toast if needed
    if (queryError && isMountedRef.current) {
      console.error('React Query error:', queryError);
      toast({
        title: "Error",
        description: "ไม่สามารถดึงข้อมูลอุปกรณ์ได้",
        variant: "destructive",
      });
    }
  }, [queryDevices, queryLoading, queryRefetching, queryTotalDevices, queryError, toast, isMountedRef]);

  // Initialize hooks for fallback device fetching strategies
  const { fetchGuestDevices } = useGuestDevices();
  const { fetchAuthenticatedDevices } = useAuthenticatedDevices({
    userId: user?.id || '',
    isAdmin,
    isSuperAdmin
  });
  const { fetchDeviceCount } = useDeviceCount();
  
  // Legacy device fetching function (used as fallback)
  const fetchDevicesLegacy = useCallback(async () => {
    if (!isMountedRef.current) {
      console.log("🔧 Component unmounted, skipping device fetch");
      return;
    }

    const startTime = Date.now();
    console.log("🔧 Starting device data fetch at:", new Date().toISOString());
    
    try {
      if (isMountedRef.current) {
        setIsRefreshing(true);
        setError(null);
      }
      
      let deviceList: DeviceInfo[] = [];
      
      if (isGuest) {
        console.log("👤 Fetching devices for guest user");
        deviceList = await fetchGuestDevices();
      } else if (user) {
        deviceList = await fetchAuthenticatedDevices();
      }
      
      if (!isMountedRef.current) return;
      
      const fetchTime = Date.now() - startTime;
      console.log(`🔧 Device fetch completed in ${fetchTime}ms`);
      console.log('🎯 Final device list with data:', deviceList.map(d => ({
        code: d.device_code,
        hasData: !!d.deviceData,
        timestamp: d.updated_at
      })));
      
      if (isMountedRef.current) {
        setDevices(deviceList);
      }
      
      // Count total unique devices (only for authenticated users)
      if (!isGuest && user && isMountedRef.current) {
        const totalCount = await fetchDeviceCount();
        if (isMountedRef.current) {
          setTotalUniqueDevices(totalCount);
        }
      } else if (isMountedRef.current) {
        setTotalUniqueDevices(deviceList.length);
        console.log(`🔧 Guest devices count: ${deviceList.length}`);
      }
      
    } catch (error) {
      console.error('Error fetching devices:', error);
      if (isMountedRef.current) {
        setError(error instanceof Error ? error.message : "Unknown error");
        toast({
          title: "Error",
          description: "ไม่สามารถดึงข้อมูลอุปกรณ์ได้",
          variant: "destructive",
        });
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [user, isGuest, fetchGuestDevices, fetchAuthenticatedDevices, fetchDeviceCount, toast, isMountedRef]);
  
  // Handler for manual refresh - use React Query first, fallback to legacy
  const handleRefresh = useCallback(async () => {
    console.log('🔄 Manual refresh triggered');
    try {
      // Try React Query refresh first
      await queryRefetch();
    } catch (error) {
      console.warn('React Query refresh failed, falling back to legacy method:', error);
      // Fallback to legacy method
      await fetchDevicesLegacy();
    }
  }, [queryRefetch, fetchDevicesLegacy]);
  
  return {
    devices,
    isLoading,
    isRefreshing,
    totalUniqueDevices,
    error,
    handleRefresh,
    isAdmin,
    isSuperAdmin
  };
}
