import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DeviceInfo } from '../types';

// Optimized guest device service - combine all requests
const fetchGuestDevicesOptimized = async (): Promise<DeviceInfo[]> => {
  console.log('🚀 Fetching optimized guest devices...');
  
  try {
    // Single query to get all guest devices with settings
    const { data: guestAccess, error: guestError } = await supabase
      .from('guest_device_access')
      .select(`
        device_code,
        device_settings!inner(device_code, display_name, graph_color, location)
      `)
      .eq('enabled', true);

    if (guestError) throw guestError;

    // Transform to DeviceInfo format
    const devices: DeviceInfo[] = (guestAccess || []).map(item => ({
      device_code: item.device_code,
      display_name: item.device_settings?.display_name || item.device_code,
      updated_at: new Date().toISOString(),
      graph_color: item.device_settings?.graph_color || '#9b87f5',
      location: item.device_settings?.location,
    }));

    console.log(`✅ Guest devices fetched: ${devices.length} devices`);
    return devices;
  } catch (error) {
    console.error('❌ Error fetching guest devices:', error);
    return [];
  }
};

export const useGuestDeviceOptimization = () => {
  return useQuery({
    queryKey: ['guest-devices-optimized'],
    queryFn: fetchGuestDevicesOptimized,
    staleTime: 900000, // 15 minutes for guests
    gcTime: 1800000, // 30 minutes GC
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 2,
  });
};

// Hook for components that need immediate access
export const useGuestDeviceImmediate = (): DeviceInfo[] => {
  const { data } = useGuestDeviceOptimization();
  return useMemo(() => data || [], [data]);
};