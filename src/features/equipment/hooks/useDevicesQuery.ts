
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
    isVisitor, 
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

  // Use original working device fetching method
  const devicesQuery = useQuery({
    queryKey,
    queryFn: async (): Promise<DeviceInfo[]> => {
      const startTime = performance.now();
      console.log(`📱 Fetching devices (mode: ${deviceAccessMode})...`);
      
      try {
        // Use the original working fetchDevicesWithDetails function
        const devices = await fetchDevicesWithDetails(
          user?.id || undefined,
          isAdmin,
          isSuperAdmin
        );

        const executionTime = performance.now() - startTime;
        console.log(`📱 Loaded ${devices.length} ${deviceAccessMode} devices in ${executionTime.toFixed(2)}ms`);
        
        return devices;
        
      } catch (error) {
        const executionTime = performance.now() - startTime;
        console.error(`🚨 Device fetch error (${executionTime.toFixed(2)}ms):`, error);
        
        // Return empty array instead of throwing to prevent cascade failures
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
    staleTime: deviceAccessMode === 'visitor' ? 300000 : 180000, // 5min for visitor, 3min for auth
    gcTime: deviceAccessMode === 'visitor' ? 900000 : 600000,   // 15min for visitor, 10min for auth
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
