import { useCallback } from 'react';
import { countUniqueDevices } from '../services';
import { useMountedRef } from './useMountedRef';

/**
 * Hook for fetching device count
 */
export function useDeviceCount() {
  const isMountedRef = useMountedRef();

  const fetchDeviceCount = useCallback(async (): Promise<number> => {
    if (!isMountedRef.current) {
      console.log('🔢 Component unmounted, skipping device count fetch');
      return 0;
    }

    try {
      const totalCount = await countUniqueDevices();
      console.log(`🔢 Total unique devices: ${totalCount}`);
      return totalCount;
    } catch (error) {
      console.error('Error fetching device count:', error);
      return 0;
    }
  }, [isMountedRef]);

  return { fetchDeviceCount };
}