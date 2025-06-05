import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { REQUIRED_DEVICE_CODES } from "@/features/equipment/services";

interface DeviceInfo {
  device_code: string;
  device_name: string;
  last_updated?: Date | null;
}

interface MeasurementData {
  symbol: string;
  name: string;
  value?: any;
}

export const useGraphSelector = () => {
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [measurements, setMeasurements] = useState<MeasurementData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, userRoles } = useAuth();
  
  const isAdmin = userRoles.includes('admin') || userRoles.includes('superadmin');
  const isSuperAdmin = userRoles.includes('superadmin');

  useEffect(() => {
    if (selectedDevice) {
      fetchMeasurements(selectedDevice);
    } else {
      setMeasurements([]);
    }
  }, [selectedDevice]);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      if (!user) {
        setDevices([]);
        setLoading(false);
        return;
      }
      
      let deviceResults: { device_code: string }[] = [];
      
      // Use the same logic as in useDeviceData.ts
      if (isSuperAdmin) {
        // For superadmin, start with required devices
        const requiredDeviceObjects = REQUIRED_DEVICE_CODES.map(deviceCode => ({
          device_code: deviceCode,
        }));
        
        deviceResults = requiredDeviceObjects;
      } else {
        // For regular users or admins
        // Get devices that user has access to
        const { data: userDevices, error: userDevicesError } = await supabase
          .from('user_device_access')
          .select('device_code')
          .eq('user_id', user.id);

        if (userDevicesError) {
          console.error("Error fetching user device access:", userDevicesError);
          setDevices([]);
          setLoading(false);
          return;
        }

        // Create a set of authorized device codes
        const authorizedDeviceCodes = new Set<string>();
        
        // Add user's authorized devices
        userDevices?.forEach(d => {
          if (d.device_code) {
            authorizedDeviceCodes.add(d.device_code);
          }
        });
        
        // If user is admin, also add required devices
        if (isAdmin) {
          REQUIRED_DEVICE_CODES.forEach(code => {
            authorizedDeviceCodes.add(code);
          });
        }
        
        deviceResults = Array.from(authorizedDeviceCodes).map(code => ({
          device_code: code
        }));
      }
      
      // Fetch custom display names from device_settings table
      const { data: deviceSettings, error: settingsError } = await supabase
        .from('device_settings')
        .select('device_code, display_name')
        .in('device_code', deviceResults.map(d => d.device_code));
      
      if (settingsError) {
        console.error("Error fetching device settings:", settingsError);
      }
      
      // Create a map of device_code to display_name
      const displayNameMap: Record<string, string> = {};
      if (deviceSettings) {
        deviceSettings.forEach(setting => {
          if (setting.display_name) {
            displayNameMap[setting.device_code] = setting.display_name;
          }
        });
      }
      
      // Get last update time for each device and format with device name
      const devicePromises = deviceResults.map(async (device) => {
        const { data: latestData, error } = await supabase
          .from('rice_quality_analysis')
          .select('created_at')
          .eq('device_code', device.device_code)
          .order('created_at', { ascending: false })
          .limit(1);
        
        const lastUpdated = latestData && latestData.length > 0 
          ? new Date(latestData[0].created_at) 
          : null;
        
        // Use custom display name if available, otherwise use default format
        const deviceName = displayNameMap[device.device_code] || `อุปกรณ์วัด ${device.device_code}`;
        
        return {
          device_code: device.device_code,
          device_name: deviceName,
          last_updated: lastUpdated
        };
      });
      
      const formattedDevices = await Promise.all(devicePromises);
      setDevices(formattedDevices);
    } catch (error) {
      console.error("Error fetching devices:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMeasurements = async (deviceCode: string) => {
    setLoading(true);
    try {
      // Get latest data for this device
      const { data, error } = await supabase
        .from('rice_quality_analysis')
        .select('*')  // Select all columns instead of specific measurements
        .eq('device_code', deviceCode)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error fetching measurements:", error);
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        setMeasurements([]);
        return;
      }

      // Transform the data for the chart, accessing the specific column directly
      const measurementsData = Object.entries(data[0])
        .filter(([key]) => !['id', 'created_at', 'updated_at', 'device_code', 'thai_datetime'].includes(key))
        .map(([key, value]) => {
          // Format the name to be more user-friendly
          const formattedName = key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
            
          return {
            symbol: key,
            name: formattedName,
            value: value // Store the actual value from the data
          };
        });
      
      setMeasurements(measurementsData);
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDevices = devices.filter(device => 
    device.device_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.device_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMeasurements = measurements.filter(measurement => 
    measurement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    measurement.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get selected device name
  const getSelectedDeviceName = () => {
    if (!selectedDevice) return "";
    return devices.find(d => d.device_code === selectedDevice)?.device_name || selectedDevice;
  };

  return {
    loading,
    devices: filteredDevices,
    measurements: filteredMeasurements,
    selectedDevice,
    searchQuery,
    setSearchQuery,
    setSelectedDevice,
    fetchDevices,
    getSelectedDeviceName
  };
};
