
import React from 'react';

export interface DeviceCardProps {
  deviceCode: string;
  deviceName?: string;
  selected: boolean;
  onSelect: () => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({ 
  deviceCode, 
  deviceName, 
  selected, 
  onSelect 
}) => {
  return (
    <div 
      className={`p-3 border rounded-md cursor-pointer ${
        selected ? 'bg-primary text-white' : 'hover:bg-gray-100'
      }`}
      onClick={onSelect}
    >
      <p className="font-medium">{deviceName || deviceCode}</p>
      {deviceName && deviceName !== deviceCode && (
        <p className="text-sm opacity-70">{deviceCode}</p>
      )}
    </div>
  );
};
