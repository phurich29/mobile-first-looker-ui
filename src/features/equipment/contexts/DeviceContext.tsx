import { createContext, useContext, ReactNode } from 'react';
import { useGlobalDeviceCache } from '../hooks/useGlobalDeviceCache';
import { DeviceInfo } from '../types';

interface DeviceContextType {
  devices: DeviceInfo[];
  isLoading: boolean;
  error: any;
  invalidateDevices: () => void;
  prefetchDevices: () => void;
}

const DeviceContext = createContext<DeviceContextType | null>(null);

export const DeviceProvider = ({ children }: { children: ReactNode }) => {
  const deviceCache = useGlobalDeviceCache();
  
  return (
    <DeviceContext.Provider value={deviceCache}>
      {children}
    </DeviceContext.Provider>
  );
};

export const useDeviceContext = () => {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDeviceContext must be used within DeviceProvider');
  }
  return context;
};

// Singleton hook - ใช้แทน useGlobalDeviceCache ใน components
export const useDevices = () => {
  return useDeviceContext();
};