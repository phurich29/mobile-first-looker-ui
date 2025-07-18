import { useDevices } from '@/features/equipment/contexts/DeviceContext';

export function useDeviceData() {
  const { devices, isLoading } = useDevices();
  
  return {
    devices,
    isLoading
  };
}