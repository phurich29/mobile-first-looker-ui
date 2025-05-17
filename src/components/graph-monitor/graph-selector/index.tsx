
import React, { useState, useEffect } from 'react';
import { DevicesList } from './DevicesList';
import { MeasurementsList } from './MeasurementsList';
import { DeviceInfo } from '../DeviceInfo';
import { MeasurementData } from '../types';

export interface GraphSelectorProps {
  onSelectGraph: (deviceCode: string, symbol: string, name: string, deviceName?: string) => void;
  open?: boolean;
  onOpenChange?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const GraphSelector: React.FC<GraphSelectorProps> = ({ 
  onSelectGraph,
  open,
  onOpenChange
}) => {
  // State for the selected device and search queries
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [deviceSearchQuery, setDeviceSearchQuery] = useState<string>('');
  const [measurementSearchQuery, setMeasurementSearchQuery] = useState<string>('');
  
  // State for devices and measurements data
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [measurements, setMeasurements] = useState<MeasurementData[]>([]);
  
  // Loading states
  const [isLoadingDevices, setIsLoadingDevices] = useState<boolean>(false);
  const [isLoadingMeasurements, setIsLoadingMeasurements] = useState<boolean>(false);

  // Fetch devices on component mount
  useEffect(() => {
    const fetchDevices = async () => {
      setIsLoadingDevices(true);
      try {
        // Simulate API call
        const response = await fetch('/api/devices');
        const data = await response.json();
        setDevices(data);
      } catch (error) {
        console.error('Error fetching devices:', error);
      } finally {
        setIsLoadingDevices(false);
      }
    };

    fetchDevices();
  }, []);

  // Fetch measurements when a device is selected
  useEffect(() => {
    if (!selectedDevice) return;

    const fetchMeasurements = async () => {
      setIsLoadingMeasurements(true);
      try {
        // Simulate API call
        const response = await fetch(`/api/measurements/${selectedDevice}`);
        const data = await response.json();
        setMeasurements(data);
      } catch (error) {
        console.error('Error fetching measurements:', error);
      } finally {
        setIsLoadingMeasurements(false);
      }
    };

    fetchMeasurements();
  }, [selectedDevice]);

  // Handle device selection
  const handleDeviceSelect = (deviceCode: string, deviceName?: string) => {
    setSelectedDevice(deviceCode);
    // Reset measurement search when changing devices
    setMeasurementSearchQuery('');
  };

  // Handle measurement selection
  const handleMeasurementSelect = (symbol: string, name: string) => {
    const selectedDeviceName = devices.find(d => d.device_code === selectedDevice)?.display_name;
    onSelectGraph(selectedDevice, symbol, name, selectedDeviceName);
    
    // Close the selector if onOpenChange is provided
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 max-h-[80vh] overflow-hidden">
      <div className="w-full md:w-1/2 overflow-y-auto">
        <h3 className="text-lg font-medium mb-4">Select Device</h3>
        <DevicesList
          devices={devices}
          isLoading={isLoadingDevices}
          selectedDevice={selectedDevice}
          onDeviceSelect={handleDeviceSelect}
          searchQuery={deviceSearchQuery}
          setSearchQuery={setDeviceSearchQuery}
        />
      </div>
      
      <div className="w-full md:w-1/2 overflow-y-auto">
        <h3 className="text-lg font-medium mb-4">Select Measurement</h3>
        <input
          type="text"
          placeholder="Search measurements..."
          value={measurementSearchQuery}
          onChange={(e) => setMeasurementSearchQuery(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <MeasurementsList
          measurements={measurements}
          isLoading={isLoadingMeasurements}
          onMeasurementSelect={handleMeasurementSelect}
          searchQuery={measurementSearchQuery}
        />
      </div>
    </div>
  );
};
