
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
 * Fetches devices with all details using the optimized database function
 */
export const fetchDevicesWithDetails = async (
  userId: string,
  isAdmin: boolean,
  isSuperAdmin: boolean
): Promise<DeviceInfo[]> => {
  console.log('Fetching devices with details using optimized database function...');
  
  try {
    // Use the new optimized database function
    const { data, error } = await supabaseAdmin.rpc('get_devices_with_details', {
      user_id_param: userId,
      is_admin_param: isAdmin,
      is_superadmin_param: isSuperAdmin
    });

    if (error) {
      console.error("Error calling get_devices_with_details:", error);
      // Fallback to legacy approach on error
      console.log('Falling back to legacy approach due to error');
      return await fallbackToLegacyApproach(userId, isAdmin, isSuperAdmin);
    }

    if (!data || !Array.isArray(data)) {
      console.log("No devices returned from function, using fallback");
      return await fallbackToLegacyApproach(userId, isAdmin, isSuperAdmin);
    }

    // Transform the data to match DeviceInfo interface
    const devices: DeviceInfo[] = data.map((item: any) => ({
      device_code: item.device_code,
      updated_at: item.updated_at,
      display_name: item.display_name || item.device_code
    }));

    console.log(`Successfully fetched ${devices.length} devices with details in single query`);
    return devices;

  } catch (error) {
    console.error('Error in fetchDevicesWithDetails:', error);
    console.log('Falling back to legacy approach due to exception');
    return await fallbackToLegacyApproach(userId, isAdmin, isSuperAdmin);
  }
};

/**
 * Fallback function that uses legacy approach when database function fails
 */
const fallbackToLegacyApproach = async (
  userId: string,
  isAdmin: boolean,
  isSuperAdmin: boolean
): Promise<DeviceInfo[]> => {
  console.log('Using fallback legacy approach...');
  
  try {
    if (isSuperAdmin) {
      const legacyDevices = await fetchSuperAdminDevices();
      return legacyDevices.map(device => ({
        device_code: device.device_code,
        updated_at: device.updated_at,
        display_name: device.device_code
      }));
    } else {
      const legacyDevices = await fetchUserDevices(userId, isAdmin);
      return legacyDevices.map(device => ({
        device_code: device.device_code,
        updated_at: device.updated_at,
        display_name: device.device_code
      }));
    }
  } catch (fallbackError) {
    console.error('Even fallback approach failed:', fallbackError);
    return [];
  }
};

/**
 * Legacy function - kept for fallback compatibility
 * Fetches all devices for a superadmin user
 */
export const fetchSuperAdminDevices = async () => {
  console.log('Using legacy fetchSuperAdminDevices - consider using fetchDevicesWithDetails');
  
  // For superadmin, always start with all 7 required devices
  const requiredDeviceObjects = REQUIRED_DEVICE_CODES.map(deviceCode => ({
    device_code: deviceCode,
    updated_at: null
  }));
  
  // Then fetch additional devices from the database if any
  const { data, error } = await supabaseAdmin
    .from('rice_quality_analysis')
    .select('device_code')
    .not('device_code', 'is', null)
    .not('device_code', 'eq', '');
    
  if (error) {
    console.error("Error fetching additional devices:", error);
    return requiredDeviceObjects;
  }
  
  // Use Set to get unique device codes
  const uniqueDeviceCodes = new Set<string>();
  
  // First add all required devices to ensure they're included
  REQUIRED_DEVICE_CODES.forEach(code => {
    uniqueDeviceCodes.add(code);
  });
  
  // Then add any additional devices from the database
  data?.forEach(item => {
    if (item.device_code && !REQUIRED_DEVICE_CODES.includes(item.device_code)) {
      uniqueDeviceCodes.add(item.device_code);
    }
  });
  
  // Convert Set to array of device codes
  const deviceCodes = Array.from(uniqueDeviceCodes);
  console.log(`Found ${deviceCodes.length} unique device codes (${REQUIRED_DEVICE_CODES.length} required + ${deviceCodes.length - REQUIRED_DEVICE_CODES.length} additional)`);
  
  // For each unique device code, get the latest entry
  const devicePromises = deviceCodes.map(async (deviceCode) => {
    const { data: latestEntry, error: latestError } = await supabaseAdmin
      .from('rice_quality_analysis')
      .select('device_code, created_at')
      .eq('device_code', deviceCode)
      .order('created_at', { ascending: false })
      .limit(1);
      
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
  });
  
  const deviceResults = await Promise.all(devicePromises);
  console.log(`Processed ${deviceResults.length} devices with timestamps`);
  
  return deviceResults;
};

/**
 * Legacy function - kept for fallback compatibility
 * Fetches devices that a user has access to
 */
export const fetchUserDevices = async (userId: string, isAdmin: boolean) => {
  console.log('Using legacy fetchUserDevices - consider using fetchDevicesWithDetails');
  
  // Create a set of authorized device codes
  const authorizedDeviceCodes = new Set<string>();
  
  // If user is admin or superadmin, always include all required devices
  if (isAdmin) {
    REQUIRED_DEVICE_CODES.forEach(code => {
      authorizedDeviceCodes.add(code);
    });
    console.log('Admin user: Added all 7 required devices');
  }
  
  // Get additional devices that user has explicit access to
  const { data: userDevices, error: userDevicesError } = await supabase
    .from('user_device_access')
    .select('device_code')
    .eq('user_id', userId);

  if (userDevicesError) {
    console.error("Error fetching user device access:", userDevicesError);
    // For admins, still return required devices even if there's an error
    if (isAdmin) {
      const requiredDevices = REQUIRED_DEVICE_CODES.map(deviceCode => ({
        device_code: deviceCode,
        updated_at: null
      }));
      console.log('Error occurred but admin gets required devices:', requiredDevices.length);
      return requiredDevices;
    }
    return [];
  }

  // Add user's explicitly authorized devices
  userDevices?.forEach(d => {
    if (d.device_code) {
      authorizedDeviceCodes.add(d.device_code);
    }
  });
  
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
 * Counts total unique devices using the optimized database function
 */
export const countUniqueDevices = async () => {
  console.log('Counting unique devices using optimized function...');
  
  try {
    // Use the database function to get accurate count
    const { data, error } = await supabaseAdmin.rpc('get_devices_with_details', {
      user_id_param: null,
      is_admin_param: false,
      is_superadmin_param: true
    });
    
    if (error) {
      console.error("Error counting devices with function:", error);
      // Fallback to legacy count
      const superAdminDevices = await fetchSuperAdminDevices();
      return superAdminDevices.length || REQUIRED_DEVICE_CODES.length;
    }
    
    const count = Array.isArray(data) ? data.length : REQUIRED_DEVICE_CODES.length;
    console.log(`Found ${count} unique devices using optimized function`);
    return count;
    
  } catch (error) {
    console.error("Error in countUniqueDevices:", error);
    // Final fallback
    return REQUIRED_DEVICE_CODES.length;
  }
};
