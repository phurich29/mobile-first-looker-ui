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

  const deviceQuery = useQuery({
    queryKey: ['devices', user?.id, isAdmin, isSuperAdmin],
    queryFn: () => fetchDevicesWithDetails(user?.id, isAdmin, isSuperAdmin),
    enabled: !!user,
    staleTime: 30000, // ข้อมูล fresh นาน 30 วินาที
    gcTime: 300000, // เก็บ cache นาน 5 นาที (React Query v5)
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const invalidateDevices = () => {
    queryClient.invalidateQueries({ queryKey: ['devices'] });
  };

  const prefetchDevices = () => {
    if (user) {
      queryClient.prefetchQuery({
        queryKey: ['devices', user.id, isAdmin, isSuperAdmin],
        queryFn: () => fetchDevicesWithDetails(user.id, isAdmin, isSuperAdmin),
        staleTime: 30000,
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
  const cachedData = queryClient.getQueryData<DeviceInfo[]>(['devices', user?.id, isAdmin, isSuperAdmin]);
  
  return cachedData || [];
};