
import React, { useState, useEffect } from "react";
import { DevicesList } from "./DevicesList";
import { MeasurementsList } from "./MeasurementsList";
import { useDeviceContext } from "@/contexts/DeviceContext";
import { DeviceInfo } from "./DeviceInfo";

export interface MeasurementData {
  id: string;
  symbol: string;
  name: string;
  device_code?: string;
}

interface GraphSelectorProps {
  onDeviceSelect: (deviceCode: string) => void;
  onMeasurementSelect: (deviceCode: string, symbol: string, name: string) => void;
  className?: string;
}

export const GraphSelector: React.FC<GraphSelectorProps> = ({
  onDeviceSelect,
  onMeasurementSelect,
  className = "",
}) => {
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [measurements, setMeasurements] = useState<MeasurementData[]>([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { selectedDeviceCode, selectDevice } = useDeviceContext();
  
  // Fetch devices on component mount
  useEffect(() => {
    fetchDevices();
    if (selectedDeviceCode) {
      setSelectedDevice(selectedDeviceCode);
    }
  }, [selectedDeviceCode]);
  
  // Fetch devices from the API
  const fetchDevices = async () => {
    setLoading(true);
    try {
      // API call would go here
      const mockDevices: DeviceInfo[] = [
        { device_code: "device1", display_name: "Device 1", last_updated: new Date().toISOString() },
        { device_code: "device2", display_name: "Device 2", last_updated: new Date().toISOString() }
      ];
      setDevices(mockDevices);
    } catch (error) {
      console.error("Error fetching devices:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Get the name of the selected device
  const getSelectedDeviceName = () => {
    const device = devices.find(d => d.device_code === selectedDevice);
    return device?.display_name || selectedDevice;
  };
  
  // Handle device selection
  const handleDeviceSelect = async (deviceCode: string, deviceName?: string) => {
    setSelectedDevice(deviceCode);
    onDeviceSelect(deviceCode);
    
    // Set as default device in context
    if (selectDevice) {
      await selectDevice(deviceCode, deviceName);
    }
    
    // Fetch measurements for the selected device
    // This would typically be an API call
    const mockMeasurements: MeasurementData[] = [
      { id: "1", symbol: "temp", name: "Temperature", device_code: deviceCode },
      { id: "2", symbol: "hum", name: "Humidity", device_code: deviceCode }
    ];
    setMeasurements(mockMeasurements);
  };
  
  // Convert devices to the format expected by the DevicesList component
  const formattedDevices = devices.map(device => ({
    device_code: device.device_code,
    display_name: device.display_name,
    last_updated: device.last_updated
  }));
  
  return (
    <div className={`flex flex-col ${className}`}>
      <DevicesList
        devices={formattedDevices}
        isLoading={loading}
        selectedDevice={selectedDevice}
        onDeviceSelect={handleDeviceSelect}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      <MeasurementsList
        measurements={measurements}
        isLoading={loading && !!selectedDevice}
        onMeasurementSelect={(symbol, name) => 
          onMeasurementSelect(selectedDevice, symbol, name)}
        searchQuery={searchQuery}
      />
    </div>
  );
};

export function useGraphSelector() {
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [measurements, setMeasurements] = useState<MeasurementData[]>([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch devices on component mount
  useEffect(() => {
    fetchDevices();
  }, []);
  
  // Fetch devices from the API
  const fetchDevices = async () => {
    setLoading(true);
    try {
      // API call would go here
      const mockDevices: DeviceInfo[] = [
        { device_code: "device1", display_name: "Device 1", last_updated: new Date().toISOString() },
        { device_code: "device2", display_name: "Device 2", last_updated: new Date().toISOString() }
      ];
      setDevices(mockDevices);
    } catch (error) {
      console.error("Error fetching devices:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Get the name of the selected device
  const getSelectedDeviceName = () => {
    const device = devices.find(d => d.device_code === selectedDevice);
    return device?.display_name || selectedDevice;
  };
  
  return {
    loading,
    devices,
    measurements,
    selectedDevice,
    searchQuery,
    setSearchQuery,
    setSelectedDevice,
    fetchDevices,
    getSelectedDeviceName
  };
}
