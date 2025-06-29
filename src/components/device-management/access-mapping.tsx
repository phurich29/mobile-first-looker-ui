
import { useEffect, useState } from "react";
import { supabaseAdmin } from "@/integrations/supabase/client"; 
import { DeviceList } from "@/components/device-management/DeviceList";
import { DeviceUserTable } from "@/components/device-management/access-mapping/DeviceUserTable";

interface Device {
  device_code: string;
}

interface User {
  id: string;
  email: string;
}

interface DeviceUserMapping {
  [key: string]: string[]; // key: device_code, value: array of user IDs
}

export function AccessMapping() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [deviceUserMap, setDeviceUserMap] = useState<DeviceUserMapping>({});
  const [userDetailsMap, setUserDetailsMap] = useState<Record<string, User>>({});
  
  // Fetch all devices from rice_quality_analysis
  const fetchAllDevices = async () => {
    setIsLoading(true);
    try {
      // Fetch all unique device codes from rice_quality_analysis
      const { data, error } = await supabaseAdmin
        .from('rice_quality_analysis')
        .select('device_code')
        .not('device_code', 'is', null)
        .not('device_code', 'eq', '');
        
      if (error) {
        console.error("Error fetching devices:", error);
        return;
      }
      
      // Get unique device codes
      const uniqueDeviceCodes = new Set<string>();
      data?.forEach(item => {
        if (item.device_code) {
          uniqueDeviceCodes.add(item.device_code);
        }
      });
      
      const deviceList = Array.from(uniqueDeviceCodes).map(code => ({
        device_code: code
      }));
      
      console.log(`Fetched ${deviceList.length} unique devices for access mapping`);
      setDevices(deviceList);

      // Fetch all users
      const { data: usersData, error: usersError } = await supabaseAdmin
        .from('profiles')
        .select('id, email')
        .order('email');

      if (usersError) {
        console.error("Error fetching users:", usersError);
      } else {
        setUsers(usersData || []);
        
        // Create user details map for quick lookup
        const userMap: Record<string, User> = {};
        (usersData || []).forEach(userData => {
          userMap[userData.id] = userData;
        });
        setUserDetailsMap(userMap);
      }
      
      // Also build the device-user mapping
      await fetchDeviceUserMapping(deviceList);
      
    } catch (error) {
      console.error("Unexpected error in fetchAllDevices:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch the mapping between devices and users
  const fetchDeviceUserMapping = async (deviceList: Device[]) => {
    try {
      // Get all user-device access records
      const { data: accessData, error: accessError } = await supabaseAdmin
        .from('user_device_access')
        .select('device_code, user_id');
        
      if (accessError) {
        console.error("Error fetching device-user mapping:", accessError);
        return;
      }
      
      // Build the mapping
      const mapping: DeviceUserMapping = {};
      
      // Initialize each device with an empty array
      deviceList.forEach(device => {
        mapping[device.device_code] = [];
      });
      
      // Populate the arrays with user IDs
      accessData?.forEach(record => {
        if (record.device_code && record.user_id) {
          if (!mapping[record.device_code]) {
            mapping[record.device_code] = [];
          }
          mapping[record.device_code].push(record.user_id);
        }
      });
      
      setDeviceUserMap(mapping);
      
    } catch (error) {
      console.error("Unexpected error in fetchDeviceUserMapping:", error);
    }
  };
  
  // Initial data load
  useEffect(() => {
    fetchAllDevices();
  }, []);
  
  // Handler for selecting a device
  const handleSelectDevice = (deviceCode: string) => {
    setSelectedDevice(deviceCode);
  };

  return (
    <div className="space-y-6">
      {selectedDevice ? (
        <DeviceUserTable 
          deviceCode={selectedDevice}
          onBack={() => setSelectedDevice(null)}
          isLoading={isLoading}
          items={[]}
        />
      ) : (
        <DeviceList 
          devices={devices} 
          deviceUserMap={deviceUserMap}
          userDetailsMap={userDetailsMap}
          isLoading={isLoading} 
          onRefresh={fetchAllDevices}
          onSelectDevice={handleSelectDevice}
        />
      )}
    </div>
  );
}
