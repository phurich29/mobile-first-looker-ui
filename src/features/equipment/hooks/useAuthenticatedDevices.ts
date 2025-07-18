
import { useCallback } from 'react';
import { fetchDevicesWithDetails } from '../services';
import { DeviceInfo } from '../types';

interface UseAuthenticatedDevicesProps {
  userId: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export function useAuthenticatedDevices({ userId, isAdmin, isSuperAdmin }: UseAuthenticatedDevicesProps) {
  const fetchAuthenticatedDevices = useCallback(async (): Promise<DeviceInfo[]> => {
    if (!userId) {
      console.log("🔐 No user ID, returning empty array");
      return [];
    }

    console.log(`🔐 Fetching authenticated devices for user: ${userId}`);
    console.log(`🔐 User permissions - isAdmin: ${isAdmin}, isSuperAdmin: ${isSuperAdmin}`);
    
    try {
      // Use the optimized service function with emergency fallback
      const devices = await fetchDevicesWithDetails(userId, isAdmin, isSuperAdmin);
      console.log(`🔐 Successfully fetched ${devices.length} authenticated devices`);
      return devices;
    } catch (error) {
      console.error('🔐 Error in fetchAuthenticatedDevices:', error);
      
      // Emergency fallback - return empty array instead of throwing
      console.log('🔐 Using emergency fallback - returning empty array');
      return [];
    }
  }, [userId, isAdmin, isSuperAdmin]);

  return { fetchAuthenticatedDevices };
}
