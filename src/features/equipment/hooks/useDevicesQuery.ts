
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { useUnifiedPermissions } from "@/hooks/useUnifiedPermissions";
import { fetchDevicesWithDetails } from "../services/deviceDataService";
import { supabase } from "@/integrations/supabase/client";
import { DeviceInfo } from "../types";
import { useCallback, useRef, useState, useEffect, useMemo } from "react";

/**
 * Optimized React Query hook with Lazy Loading approach
 */
export const useDevicesQuery = () => {
  const { user, isAuthReady } = useAuth();
  const { 
    isGuest, 
    isAdmin, 
    isSuperAdmin, 
    isAuthenticated,
    deviceAccessMode 
  } = useUnifiedPermissions();
  
  // Simplified query enablement
  const isQueryEnabled = isAuthReady;
  
  // Simplified loading state management
  const [isRefreshingState, setIsRefreshingState] = useState(false);
  
  // Unified query key based on access mode
  const queryKey = useMemo(() => ['unified-devices', deviceAccessMode, user?.id], [deviceAccessMode, user?.id]);

  // Single unified devices query - no more separate guest/auth queries
  const devicesQuery = useQuery({
    queryKey,
    queryFn: async (): Promise<DeviceInfo[]> => {
      console.log(`📱 Fetching devices (mode: ${deviceAccessMode})...`);
      
      try {
        if (deviceAccessMode === 'guest') {
          // Use rate-limited function for guests
          const { data, error } = await supabase.rpc('rate_limited_guest_devices');
          
          if (error) {
            console.error('❌ Guest devices error:', error);
            return []; // Graceful fallback
          }
          
          const devices: DeviceInfo[] = (data || []).map((device: any) => ({
            device_code: device.device_code,
            display_name: device.display_name || device.device_code,
            updated_at: device.updated_at || new Date().toISOString(),
            deviceData: null
          }));

          console.log(`📱 Loaded ${devices.length} guest devices with rate limiting`);
          return devices;
          
        } else {
          // Use unified function for authenticated users (all modes)
          const { data, error } = await supabase.rpc('get_devices_with_details', {
            user_id_param: user?.id || null,
            is_admin_param: isAdmin,
            is_superadmin_param: isSuperAdmin
          });
          
          if (error) {
            console.error('❌ Authenticated devices error:', error);
            return []; // Graceful fallback
          }
          
          const devices: DeviceInfo[] = (data || []).map((device: any) => ({
            device_code: device.device_code,
            display_name: device.display_name || device.device_code,
            updated_at: device.updated_at || new Date().toISOString(),
            deviceData: null
          }));

          console.log(`📱 Loaded ${devices.length} authenticated devices (${deviceAccessMode})`);
          return devices;
        }
      } catch (error) {
        console.error('🚨 Unified device fetch error:', error);
        return []; // Always return empty array, never throw
      }
    },
    enabled: isQueryEnabled,
    retry: 1, // Minimal retries
    retryDelay: 2000,
    refetchOnWindowFocus: false,
    staleTime: deviceAccessMode === 'guest' ? 120000 : 60000, // 2min for guest, 1min for auth
    gcTime: deviceAccessMode === 'guest' ? 600000 : 300000,   // 10min for guest, 5min for auth
  });

  // Simplified device count
  const totalUniqueDevices = devicesQuery.data?.length || 0;
  
  // Enhanced refetch with unified approach
  const enhancedRefetch = useCallback(async () => {
    console.log('🔄 Unified refetch triggered');
    setIsRefreshingState(true);
    try {
      const result = await devicesQuery.refetch();
      return result;
    } catch (error) {
      console.error('❌ Unified refetch failed:', error);
      throw error;
    } finally {
      setIsRefreshingState(false);
    }
  }, [devicesQuery.refetch]);
  
  return {
    devices: devicesQuery.data || [],
    isLoading: devicesQuery.isLoading,
    isRefreshing: isRefreshingState || devicesQuery.isFetching,
    error: devicesQuery.error,
    totalUniqueDevices,
    refetch: enhancedRefetch,
    isAdmin,
    isSuperAdmin,
  };
};
