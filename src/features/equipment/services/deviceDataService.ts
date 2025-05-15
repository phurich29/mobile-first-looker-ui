
import { supabase, supabaseAdmin } from "@/integrations/supabase/client";
import { DeviceInfo } from "../types";

// List of required device codes that must be displayed
export const REQUIRED_DEVICE_CODES = [
  '6000306302144',
  '6000306302140',
  '6400000401493',
  '6000306302141',
  '6400000401483',
  '6400000401398',
  '6400000401503'
];

/**
 * Fetches all devices for a superadmin user
 */
export const fetchSuperAdminDevices = async () => {
  console.log('Starting with required devices for superadmin');
  
  // For superadmin, start with required devices
  const requiredDeviceObjects = REQUIRED_DEVICE_CODES.map(deviceCode => ({
    device_code: deviceCode,
    updated_at: null
  }));
  
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
  REQUIRED_DEVICE_CODES.forEach(code => {
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
    if (REQUIRED_DEVICE_CODES.includes(deviceCode)) {
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
};

/**
 * Fetches devices that a user has access to
 */
export const fetchUserDevices = async (userId: string, isAdmin: boolean) => {
  console.log('Fetching authorized devices for user...');
  
  // Get devices that user has access to
  const { data: userDevices, error: userDevicesError } = await supabase
    .from('user_device_access')
    .select('device_code')
    .eq('user_id', userId);

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
    REQUIRED_DEVICE_CODES.forEach(code => {
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
};

/**
 * Counts total unique devices in the system
 */
export const countUniqueDevices = async () => {
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
};
