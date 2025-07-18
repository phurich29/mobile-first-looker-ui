
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useGuestMode } from "@/hooks/useGuestMode";
import { useToast } from "@/components/ui/use-toast";
import { DeviceInfo } from "../types";
import { useGuestDevices } from "./useGuestDevices";
import { useAuthenticatedDevices } from "./useAuthenticatedDevices";
import { useDeviceCount } from "./useDeviceCount";
import { useMountedRef } from "./useMountedRef";

export function useDeviceData() {
  const { user, userRoles } = useAuth();
  const { isGuest } = useGuestMode();
  const { toast } = useToast();
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalUniqueDevices, setTotalUniqueDevices] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const isMountedRef = useMountedRef();
  
  const isAdmin = userRoles.includes('admin');
  const isSuperAdmin = userRoles.includes('superadmin');

  // Initialize hooks for different device fetching strategies
  const { fetchGuestDevices } = useGuestDevices();
  const { fetchAuthenticatedDevices } = useAuthenticatedDevices({
    userId: user?.id || '',
    isAdmin,
    isSuperAdmin
  });
  const { fetchDeviceCount } = useDeviceCount();
  
  // Main device fetching function with timeout and circuit breaker
  const fetchDevices = useCallback(async () => {
    if (!isMountedRef.current || isRefreshing) {
      console.log("🔧 Skipping fetch - component unmounted or already refreshing");
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
      
      // Add timeout wrapper for all fetch operations
      const fetchWithTimeout = async (fetchFn: () => Promise<DeviceInfo[]>, timeoutMs = 10000) => {
        return Promise.race([
          fetchFn(),
          new Promise<DeviceInfo[]>((_, reject) => 
            setTimeout(() => reject(new Error('Fetch timeout')), timeoutMs)
          )
        ]);
      };
      
      if (isGuest) {
        console.log("👤 Fetching devices for guest user");
        deviceList = await fetchWithTimeout(() => fetchGuestDevices(), 8000);
      } else if (user) {
        console.log("🔐 Fetching devices for authenticated user");
        deviceList = await fetchWithTimeout(() => fetchAuthenticatedDevices(), 10000);
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
        setHasInitialized(true);
      }
      
      // Count total unique devices (only for authenticated users)
      if (!isGuest && user && isMountedRef.current) {
        try {
          const totalCount = await Promise.race([
            fetchDeviceCount(),
            new Promise<number>((_, reject) => 
              setTimeout(() => reject(new Error('Count timeout')), 5000)
            )
          ]);
          if (isMountedRef.current) {
            setTotalUniqueDevices(totalCount);
          }
        } catch (countError) {
          console.warn('🔧 Device count failed, using fallback:', countError);
          if (isMountedRef.current) {
            setTotalUniqueDevices(deviceList.length);
          }
        }
      } else if (isMountedRef.current) {
        setTotalUniqueDevices(deviceList.length);
        console.log(`🔧 Guest devices count: ${deviceList.length}`);
      }
      
    } catch (error) {
      console.error('🔧 Error fetching devices:', error);
      if (isMountedRef.current) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        setError(errorMessage);
        
        // Don't show toast for timeout errors in guest mode to avoid spam
        if (!isGuest || !errorMessage.includes('timeout')) {
          toast({
            title: "Error",
            description: "ไม่สามารถดึงข้อมูลอุปกรณ์ได้",
            variant: "destructive",
          });
        }
        
        // Set empty devices on error to prevent infinite loading
        setDevices([]);
        setTotalUniqueDevices(0);
        setHasInitialized(true);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [user, isGuest, fetchGuestDevices, fetchAuthenticatedDevices, fetchDeviceCount, toast, isMountedRef, isRefreshing]);
  
  // Initial fetch with debouncing
  useEffect(() => {
    if (hasInitialized) {
      console.log("🔧 Already initialized, skipping fetch");
      return;
    }

    const timeoutId = setTimeout(() => {
      fetchDevices();
    }, 100); // Small delay to prevent multiple rapid calls

    return () => clearTimeout(timeoutId);
  }, [fetchDevices, hasInitialized]);

  // Handler for manual refresh
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) {
      console.log("🔧 Already refreshing, ignoring refresh request");
      return;
    }
    console.log("🔧 Manual refresh triggered");
    await fetchDevices();
  }, [fetchDevices, isRefreshing]);
  
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
