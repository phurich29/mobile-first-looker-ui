
import { useDevicesQuery } from '@/features/equipment/hooks/useDevicesQuery';

interface Device {
  device_code: string;
  display_name?: string;
}

/**
 * Optimized header device data hook using unified React Query
 * Prevents duplicate API calls by using the same query as the main equipment page
 */
export const useDeviceData = () => {
  const { devices: allDevices, isLoading: isLoadingDevices } = useDevicesQuery();

  // Transform devices to match header interface
  const devices: Device[] = allDevices.map(device => ({
    device_code: device.device_code,
    display_name: device.display_name || device.device_code
  }));

  console.log(`TopHeader: Using shared React Query data - ${devices.length} devices`);

  return { devices, isLoadingDevices };
};
