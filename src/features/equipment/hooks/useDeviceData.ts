
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  const isMountedRef = useMountedRef();
  const abortControllerRef = useRef<AbortController | null>(null);
  
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

  // Create stable values for dependencies
  const stableUserId = user?.id || '';
  const stableIsGuest = isGuest;
  const stableIsAdmin = isAdmin;
  const stableIsSuperAdmin = isSuperAdmin;
  
  // Main device fetching function with proper dependencies
  const fetchDevices = useCallback(async () => {
    if (!isMountedRef.current) {
      console.log("🔧 Component unmounted, skipping device fetch");
      return;
    }

    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const startTime = Date.now();
    console.log("🔧 Starting device data fetch at:", new Date().toISOString());
    
    try {
      if (isMountedRef.current && !signal.aborted) {
        setIsRefreshing(true);
        setError(null);
      }
      
      let deviceList: DeviceInfo[] = [];
      
      if (stableIsGuest) {
        console.log("👤 Fetching devices for guest user");
        deviceList = await fetchGuestDevices();
      } else if (stableUserId) {
        deviceList = await fetchAuthenticatedDevices();
      }
      
      if (!isMountedRef.current || signal.aborted) return;
      
      const fetchTime = Date.now() - startTime;
      console.log(`🔧 Device fetch completed in ${fetchTime}ms`);
      console.log('🎯 Final device list with data:', deviceList.map(d => ({
        code: d.device_code,
        hasData: !!d.deviceData,
        timestamp: d.updated_at
      })));
      
      if (isMountedRef.current && !signal.aborted) {
        setDevices(deviceList);
      }
      
      // Count total unique devices (only for authenticated users)
      if (!stableIsGuest && stableUserId && isMountedRef.current && !signal.aborted) {
        const totalCount = await fetchDeviceCount();
        if (isMountedRef.current && !signal.aborted) {
          setTotalUniqueDevices(totalCount);
        }
      } else if (isMountedRef.current && !signal.aborted) {
        setTotalUniqueDevices(deviceList.length);
        console.log(`🔧 Guest devices count: ${deviceList.length}`);
      }
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🔧 Device fetch was aborted');
        return;
      }
      
      console.error('Error fetching devices:', error);
      if (isMountedRef.current && !abortControllerRef.current?.signal.aborted) {
        setError(error instanceof Error ? error.message : "Unknown error");
        toast({
          title: "Error",
          description: "ไม่สามารถดึงข้อมูลอุปกรณ์ได้",
          variant: "destructive",
        });
      }
    } finally {
      if (isMountedRef.current && !abortControllerRef.current?.signal.aborted) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [
    stableUserId, 
    stableIsGuest, 
    fetchGuestDevices, 
    fetchAuthenticatedDevices, 
    fetchDeviceCount, 
    toast, 
    isMountedRef
  ]);
  
  // Initial fetch with dependency on stable values
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    // Add a small delay to prevent rapid re-renders
    timeoutId = setTimeout(() => {
      fetchDevices();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchDevices]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Handler for manual refresh
  const handleRefresh = useCallback(async () => {
    await fetchDevices();
  }, [fetchDevices]);

  // Memoize return values to prevent unnecessary re-renders
  const returnValue = useMemo(() => ({
    devices,
    isLoading,
    isRefreshing,
    totalUniqueDevices,
    error,
    handleRefresh,
    isAdmin: stableIsAdmin,
    isSuperAdmin: stableIsSuperAdmin
  }), [
    devices,
    isLoading,
    isRefreshing,
    totalUniqueDevices,
    error,
    handleRefresh,
    stableIsAdmin,
    stableIsSuperAdmin
  ]);
  
  return returnValue;
}
