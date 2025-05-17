import React from 'react';
import { DeviceInfo } from '../DeviceInfo';
import { DeviceCard } from './DeviceCard';

export interface DevicesListProps {
  devices: DeviceInfo[];
  loading?: boolean; 
  isLoading?: boolean; // Add this to support both prop names
  selectedDevice: string;
  onDeviceSelect: (deviceCode: string, deviceName?: string) => void;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

export const DevicesList: React.FC<DevicesListProps> = ({
  devices,
  loading = false,
  isLoading = false, // Support both prop names
  selectedDevice,
  onDeviceSelect,
  searchQuery,
  setSearchQuery,
}) => {
  // Use either loading or isLoading
  const isLoadingState = loading || isLoading;

  const filteredDevices = devices.filter(device =>
    device.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.device_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Search devices..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      />
      {isLoadingState ? (
        <div>Loading devices...</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {filteredDevices.map((device) => (
            <DeviceCard
              key={device.device_code}
              device={device}
              selected={device.device_code === selectedDevice}
              onSelect={() => onDeviceSelect(device.device_code, device.display_name)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
