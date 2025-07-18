
import { useCallback } from 'react';
import { fetchDeviceCount } from '../services';

export function useDeviceCount() {
  const fetchCount = useCallback(async (): Promise<number> => {
    console.log("🔢 Fetching device count");
    
    try {
      const count = await fetchDeviceCount();
      console.log(`🔢 Device count: ${count}`);
      return count;
    } catch (error) {
      console.error('🔢 Error fetching device count:', error);
      return 0;
    }
  }, []);

  return { fetchDeviceCount: fetchCount };
}
