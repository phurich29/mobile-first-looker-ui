import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchDevicesWithDetails } from '../services/deviceDataService';
import { useAuth } from '@/components/AuthProvider';
import { DeviceInfo } from '../types';

// Global device cache with request deduplication
export const useGlobalDeviceCache = () => {
  const { user, userRoles } = useAuth();
  const queryClient = useQueryClient();
  
  const isAdmin = userRoles.includes('admin');
  const isSuperAdmin = userRoles.includes('superadmin');

  // Stabilize query key - only change when user ID changes
  const stableQueryKey = ['devices', user?.id];

  const deviceQuery = useQuery({
    queryKey: stableQueryKey,
    queryFn: () => fetchDevicesWithDetails(user?.id, isAdmin, isSuperAdmin),
    enabled: !!user,
    staleTime: 300000, // เพิ่มเป็น 5 นาที
    gcTime: 600000, // เพิ่มเป็น 10 นาที
    refetchOnWindowFocus: false,
    refetchOnMount: false, // ไม่ refetch เมื่อ component mount
    refetchOnReconnect: false, // ไม่ refetch เมื่อ network reconnect
    retry: 1, // ลดจำนวน retry
  });

  const invalidateDevices = () => {
    queryClient.invalidateQueries({ queryKey: ['devices'] });
  };

  const prefetchDevices = () => {
    if (user) {
      queryClient.prefetchQuery({
        queryKey: ['devices', user.id],
        queryFn: () => fetchDevicesWithDetails(user.id, isAdmin, isSuperAdmin),
        staleTime: 300000,
      });
    }
  };

  return {
    devices: deviceQuery.data || [],
    isLoading: deviceQuery.isLoading,
    error: deviceQuery.error,
    invalidateDevices,
    prefetchDevices,
  };
};

// Hook สำหรับ components ที่ต้องการ device list แต่ไม่อยากรอ
export const useDeviceListOptimistic = (): DeviceInfo[] => {
  const queryClient = useQueryClient();
  const { user, userRoles } = useAuth();
  
  const isAdmin = userRoles.includes('admin');
  const isSuperAdmin = userRoles.includes('superadmin');
  
  // ลองหา cache ที่มีอยู่ก่อน
  const cachedData = queryClient.getQueryData<DeviceInfo[]>(['devices', user?.id]);
  
  return cachedData || [];
};