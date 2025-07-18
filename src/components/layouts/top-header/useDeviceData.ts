
import { useAuth } from '@/components/AuthProvider';
import { useGlobalDeviceCache } from '@/features/equipment/hooks/useGlobalDeviceCache';

interface Device {
  device_code: string;
  display_name?: string;
}

export const useDeviceData = () => {
  const { user } = useAuth();
  const { devices: cachedDevices, isLoading } = useGlobalDeviceCache();

  // Transform to match the expected interface
  const devices = cachedDevices.map(device => ({
    device_code: device.device_code,
    display_name: device.display_name || device.device_code
  }));

  return { 
    devices: user ? devices : [], 
    isLoadingDevices: isLoading 
  };
};
