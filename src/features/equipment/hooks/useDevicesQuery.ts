
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { useGuestMode } from "@/hooks/useGuestMode";
import { fetchDevicesWithDetails } from "../services/deviceDataService";
import { supabase } from "@/integrations/supabase/client";
import { DeviceInfo } from "../types";
import { useCallback, useRef, useState, useEffect, useMemo } from "react";

/**
 * Optimized React Query hook with Lazy Loading approach
 */
export const useDevicesQuery = () => {
  const { user, userRoles, isAuthReady } = useAuth();
  const { isGuest, isStable } = useGuestMode();
  
  const isAdmin = userRoles.includes('admin');
  const isSuperAdmin = userRoles.includes('superadmin');
  
  // Only run queries when auth is ready and stable
  const isQueryEnabled = isAuthReady && isStable;
  
  // Simplified loading state management
  const [isRefreshingState, setIsRefreshingState] = useState(false);
  
  // Memoized query keys for stability
  const guestQueryKey = useMemo(() => ['guest-devices'], []);
  const authenticatedQueryKey = useMemo(() => ['devices-details', user?.id], [user?.id]);

  // Basic devices query for guests - with rate limiting
  const guestDevicesQuery = useQuery({
    queryKey: guestQueryKey,
    queryFn: async (): Promise<DeviceInfo[]> => {
      console.log('📱 Using rate-limited guest devices...');
      
      try {
        // ใช้ rate-limited function แทน direct queries
        const { data, error } = await supabase.rpc('rate_limited_guest_devices');
        
        if (error) {
          console.error('❌ Rate-limited guest devices error:', error);
          throw error;
        }
        
        if (!data?.length) return [];

        // แปลงข้อมูลให้ match DeviceInfo interface
        const devices: DeviceInfo[] = data.map((device: any) => ({
          device_code: device.device_code,
          display_name: device.display_name || device.device_code,
          updated_at: device.updated_at || new Date().toISOString(),
          deviceData: null // No device data in basic loading
        }));

        console.log(`📱 Loaded ${devices.length} guest devices with rate limiting`);
        return devices;
      } catch (error) {
        console.error('🚨 Guest devices query failed:', error);
        // Return empty array แทน throw เพื่อป้องกัน cascade failures
        return [];
      }
    },
    enabled: isQueryEnabled && isGuest,
    retry: 1, // ลด retries
    retryDelay: 2000, // เพิ่ม delay ระหว่าง retries
    refetchOnWindowFocus: false,
    staleTime: 60000, // เพิ่ม stale time เป็น 1 นาที
    gcTime: 300000, // เพิ่ม garbage collection time เป็น 5 นาที
  });

  // Authenticated devices query - also lazy loaded
  const authenticatedDevicesQuery = useQuery({
    queryKey: authenticatedQueryKey,
    queryFn: async (): Promise<DeviceInfo[]> => {
      if (!user?.id) return [];
      
      console.log('🔐 Fetching basic authenticated devices...');
      
      const deviceList = await fetchDevicesWithDetails(
        user.id,
        isAdmin,
        isSuperAdmin
      );

      if (deviceList.length === 0) return [];

      // Return basic device info without analysis data initially
      const basicDeviceList = deviceList.map(device => ({
        ...device,
        deviceData: null // No device data in basic loading
      }));

      console.log(`🔐 Loaded basic info for ${basicDeviceList.length} authenticated devices`);
      return basicDeviceList;
    },
    enabled: isQueryEnabled && !!user && !isGuest,
    retry: 1, // Reduced retries
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    staleTime: 20000, // 20 seconds stale time
    gcTime: 180000, // 3 minutes garbage collection
  });

  // Device count query - simplified
  const deviceCountQuery = useQuery({
    queryKey: ['device-count', isGuest, user?.id],
    queryFn: async () => {
      const activeQuery = isGuest ? guestDevicesQuery : authenticatedDevicesQuery;
      return activeQuery.data?.length || 0;
    },
    enabled: isQueryEnabled,
    retry: 1,
    staleTime: 60000, // 1 minute cache for count
  });

  // Return the appropriate query based on user type
  const activeQuery = isGuest ? guestDevicesQuery : authenticatedDevicesQuery;
  
  // Enhanced refetch with minimal loading state
  const enhancedRefetch = useCallback(async () => {
    console.log('🔄 Enhanced refetch triggered');
    setIsRefreshingState(true);
    try {
      const result = await activeQuery.refetch();
      return result;
    } catch (error) {
      console.error('❌ Enhanced refetch failed:', error);
      throw error;
    } finally {
      setIsRefreshingState(false);
    }
  }, [activeQuery.refetch]);
  
  return {
    devices: activeQuery.data || [],
    isLoading: activeQuery.isLoading,
    isRefreshing: isRefreshingState || activeQuery.isFetching,
    error: activeQuery.error,
    totalUniqueDevices: deviceCountQuery.data || 0,
    refetch: enhancedRefetch,
    isAdmin,
    isSuperAdmin,
  };
};
