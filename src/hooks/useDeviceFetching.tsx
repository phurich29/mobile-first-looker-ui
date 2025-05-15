
import { useState, useCallback, useEffect } from "react";
import { supabase, supabaseAdmin } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";

// List of required device codes that must be displayed
const REQUIRED_DEVICE_CODES = [
  '6000306302144',
  '6000306302140',
  '6400000401493',
  '6000306302141',
  '6400000401483',
  '6400000401398',
  '6400000401503'
];

export interface DeviceInfo {
  device_code: string;
  updated_at: string | null;
}

export function useDeviceFetching() {
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [totalUniqueDevices, setTotalUniqueDevices] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const { toast } = useToast();
  const { user, userRoles } = useAuth();
  
  const isAdmin = userRoles.includes('admin') || userRoles.includes('superadmin');
  const isSuperAdmin = userRoles.includes('superadmin');

  // Function to fetch ALL device data including required devices
  const fetchAllDevices = useCallback(async () => {
    try {
      if (!user) return [];

      console.log('Fetching devices...');
      
      // Always include these specific devices in the result
      const requiredDevices = [...REQUIRED_DEVICE_CODES];
      console.log('Required devices:', requiredDevices);
      
      if (isSuperAdmin) {
        // For superadmin, start with required devices
        const requiredDeviceObjects = requiredDevices.map(deviceCode => ({
          device_code: deviceCode,
          updated_at: null
        }));
        
        console.log('Starting with required devices for superadmin');
        
        // Then fetch all devices from the database
        const { data, error } = await supabaseAdmin
          .from('rice_quality_analysis')
          .select('device_code')
          .not('device_code', 'is', null)
          .not('device_code', 'eq', '');
          
        if (error) {
          console.error("Error fetching all devices:", error);
          // Even if there's an error, still return the required devices
          return requiredDeviceObjects;
        }
        
        // Process to get unique devices with latest timestamp
        if (!data || data.length === 0) {
          console.log("No devices found in database, using required devices only");
          return requiredDeviceObjects;
        }
        
        // Use Set to get unique device codes
        const uniqueDeviceCodes = new Set<string>();
        
        // First add all required devices
        requiredDevices.forEach(code => {
          uniqueDeviceCodes.add(code);
        });
        
        // Then add any additional devices from the database
        data.forEach(item => {
          if (item.device_code) {
            uniqueDeviceCodes.add(item.device_code);
          }
        });
        
        // Convert Set to array of device codes
        const deviceCodes = Array.from(uniqueDeviceCodes);
        console.log(`Found ${deviceCodes.length} unique device codes after merging`);
        
        // For each unique device code, get the latest entry
        const devicePromises = deviceCodes.map(async (deviceCode) => {
          // For required devices that aren't in the database yet, just return with null timestamp
          if (requiredDevices.includes(deviceCode)) {
            const { data: latestEntry, error: latestError } = await supabaseAdmin
              .from('rice_quality_analysis')
              .select('device_code, created_at')
              .eq('device_code', deviceCode)
              .order('created_at', { ascending: false })
              .limit(1);
              
            // If there's data, use it, otherwise use null timestamp
            if (latestError || !latestEntry || latestEntry.length === 0) {
              return {
                device_code: deviceCode,
                updated_at: null
              };
            }
            
            return {
              device_code: deviceCode,
              updated_at: latestEntry[0].created_at
            };
          }
          
          // For other devices, get their latest timestamp
          const { data: latestEntry, error: latestError } = await supabaseAdmin
            .from('rice_quality_analysis')
            .select('device_code, created_at')
            .eq('device_code', deviceCode)
            .order('created_at', { ascending: false })
            .limit(1);
            
          if (latestError) {
            console.error(`Error fetching latest data for device ${deviceCode}:`, latestError);
            return {
              device_code: deviceCode,
              updated_at: null
            };
          }
          
          return {
            device_code: deviceCode,
            updated_at: latestEntry && latestEntry.length > 0 ? latestEntry[0].created_at : null
          };
        });
        
        const deviceResults = await Promise.all(devicePromises);
        console.log(`Processed ${deviceResults.length} devices with timestamps`);
        
        return deviceResults;
      } 
      // For regular users and admins, show only authorized devices
      else {
        console.log('Fetching authorized devices for user...');
        
        // Get devices that user has access to
        const { data: userDevices, error: userDevicesError } = await supabase
          .from('user_device_access')
          .select('device_code')
          .eq('user_id', user.id);

        if (userDevicesError) {
          console.error("Error fetching user device access:", userDevicesError);
          return [];
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
          requiredDevices.forEach(code => {
            authorizedDeviceCodes.add(code);
          });
        }
        
        if (authorizedDeviceCodes.size === 0) {
          console.log("User has no device access permissions.");
          return [];
        }

        console.log("Authorized device codes:", Array.from(authorizedDeviceCodes));
        
        // Get data for authorized devices
        const authorizedDeviceArray = Array.from(authorizedDeviceCodes);
        const devicePromises = authorizedDeviceArray.map(async (deviceCode) => {
          const { data: deviceData, error: deviceError } = await supabase
            .from('rice_quality_analysis')
            .select('device_code, created_at')
            .eq('device_code', deviceCode)
            .order('created_at', { ascending: false })
            .limit(1);

          if (deviceError) {
            console.error(`Error fetching data for device ${deviceCode}:`, deviceError);
            return {
              device_code: deviceCode,
              updated_at: null
            };
          }

          return {
            device_code: deviceCode,
            updated_at: deviceData && deviceData.length > 0 ? deviceData[0].created_at : null
          };
        });

        const deviceResults = await Promise.all(devicePromises);
        console.log("Fetched authorized devices for user:", deviceResults.length);
        return deviceResults;
      }
    } catch (error) {
      console.error("Error in fetchAllDevices:", error);
      // Return required devices even if there's an error
      return REQUIRED_DEVICE_CODES.map(code => ({
        device_code: code,
        updated_at: null
      }));
    }
  }, [user, userRoles, isSuperAdmin, isAdmin]);

  // Count total unique devices (for superadmin only)
  const getUniqueDevicesCount = useCallback(async () => {
    try {
      if (!user || !isSuperAdmin) return 0;
      
      console.log('Counting unique devices...');
      
      // Fetch all device codes from rice_quality_analysis
      const { data, error } = await supabaseAdmin
        .from('rice_quality_analysis')
        .select('device_code')
        .not('device_code', 'is', null)
        .not('device_code', 'eq', '');
        
      if (error) {
        console.error("Error counting unique devices:", error);
        return 0;
      }
      
      // Get unique device codes
      const uniqueDeviceCodes = new Set();
      data?.forEach(item => {
        if (item.device_code) {
          uniqueDeviceCodes.add(item.device_code);
        }
      });
      
      // Also add required devices to the count
      REQUIRED_DEVICE_CODES.forEach(code => {
        uniqueDeviceCodes.add(code);
      });
      
      const count = uniqueDeviceCodes.size;
      console.log(`Found ${count} unique devices`);
      return count;
    } catch (error) {
      console.error("Unexpected error counting devices:", error);
      return 0;
    }
  }, [user, isSuperAdmin]);

  // Handle refresh - Using comprehensive approach to ensure all devices are fetched
  const handleRefresh = async () => {
    try {
      console.log("Refreshing device data...");
      setIsRefreshing(true);
      
      const deviceData = await fetchAllDevices();
      setDevices(deviceData);
      
      toast({
        title: "อัพเดทข้อมูลสำเร็จ",
        description: deviceData.length > 0 
          ? `พบ ${deviceData.length} อุปกรณ์ที่คุณมีสิทธิ์เข้าถึง` 
          : "ไม่พบอุปกรณ์ที่คุณมีสิทธิ์เข้าถึง",
      });
      
      // For superadmin, update the total count too
      if (isSuperAdmin) {
        const count = await getUniqueDevicesCount();
        setTotalUniqueDevices(count);
      }
    } catch (error) {
      console.error("Refresh error:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัพเดทข้อมูลได้",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    devices,
    isRefreshing,
    totalUniqueDevices,
    fetchAllDevices,
    getUniqueDevicesCount,
    handleRefresh,
    isAdmin,
    isSuperAdmin
  };
}
