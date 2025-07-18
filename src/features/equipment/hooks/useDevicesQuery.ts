
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

  // Single unified devices query with circuit breaker and optimization
  const devicesQuery = useQuery({
    queryKey,
    queryFn: async (): Promise<DeviceInfo[]> => {
      const startTime = performance.now();
      console.log(`📱 Fetching devices (mode: ${deviceAccessMode}) with optimizations...`);
      
      try {
        let data, error;
        
        if (deviceAccessMode === 'guest') {
          // Use super fast optimized function for guests
          const result = await supabase.rpc('get_super_fast_guest_devices');
          data = result.data;
          error = result.error;
          
        } else {
          // Use super fast optimized function for authenticated users
          const result = await supabase.rpc('get_super_fast_auth_devices', {
            user_id_param: user?.id || null,
            is_admin_param: isAdmin,
            is_superadmin_param: isSuperAdmin
          });
          data = result.data;
          error = result.error;
        }
        
        if (error) {
          console.error(`❌ Optimized ${deviceAccessMode} devices error:`, error);
          // Return empty array แทน throw เพื่อป้องกัน cascade failures
          return [];
        }
        
        const devices: DeviceInfo[] = (data || []).map((device: any) => ({
          device_code: device.device_code,
          display_name: device.display_name || device.device_code,
          updated_at: device.updated_at || new Date().toISOString(),
          deviceData: null
        }));

        const executionTime = performance.now() - startTime;
        console.log(`📱 Loaded ${devices.length} ${deviceAccessMode} devices in ${executionTime.toFixed(2)}ms (optimized)`);
        
        // Log performance for monitoring
        if (executionTime > 100) {
          console.warn(`⚠️ Slow query detected: ${deviceAccessMode} devices took ${executionTime.toFixed(2)}ms`);
        }
        
        return devices;
        
      } catch (error) {
        const executionTime = performance.now() - startTime;
        console.error(`🚨 Optimized device fetch error (${executionTime.toFixed(2)}ms):`, error);
        
        // Circuit breaker pattern - return empty instead of throw
        return [];
      }
    },
    enabled: isQueryEnabled,
    retry: (failureCount, error) => {
      // Circuit breaker: stop retrying after 1 failure for optimized queries
      if (failureCount >= 1) {
        console.warn(`🔴 Circuit breaker opened for ${deviceAccessMode} devices query`);
        return false;
      }
      return true;
    },
    retryDelay: 3000, // เพิ่ม delay ระหว่าง retries
    refetchOnWindowFocus: false,
    staleTime: deviceAccessMode === 'guest' ? 300000 : 180000, // 5min for guest, 3min for auth
    gcTime: deviceAccessMode === 'guest' ? 900000 : 600000,   // 15min for guest, 10min for auth
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
