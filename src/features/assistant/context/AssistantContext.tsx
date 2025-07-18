import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { useDevices } from '@/features/equipment/contexts/DeviceContext';
import { DeviceInfo } from '@/features/equipment/types';

interface AssistantContextType {
  devices: DeviceInfo[];
  isLoading: boolean;
  selectedDevice?: DeviceInfo;
  selectedDeviceCode: string;
  setSelectedDeviceCode: (code: string) => void;
  handleRefresh: () => void;
}

const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

export const AssistantProvider = ({ children }: { children: ReactNode }) => {
  const {
    devices,
    isLoading,
    invalidateDevices,
  } = useDevices();
  const [selectedDeviceCode, setSelectedDeviceCode] = useState('');

  const selectedDevice = useMemo(
    () => devices.find((d) => d.device_code === selectedDeviceCode),
    [devices, selectedDeviceCode]
  );

  const value = {
    devices,
    isLoading,
    selectedDevice,
    selectedDeviceCode,
    setSelectedDeviceCode,
    handleRefresh: invalidateDevices,
  };

  return (
    <AssistantContext.Provider value={value}>
      {children}
    </AssistantContext.Provider>
  );
};

export const useAssistant = () => {
  const context = useContext(AssistantContext);
  if (context === undefined) {
    throw new Error('useAssistant must be used within an AssistantProvider');
  }
  return context;
};
