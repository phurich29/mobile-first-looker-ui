
import { supabaseAdmin } from "@/integrations/supabase/client";
import { DeviceInfo } from "../types";
import { fetchSuperAdminDevices, fetchUserDevices } from "./legacyDeviceService";

/**
 * Fetches devices with all details using the optimized database function
 */
export const fetchDevicesWithDetails = async (
  userId: string,
  isAdmin: boolean,
  isSuperAdmin: boolean
): Promise<DeviceInfo[]> => {
  console.log('Fetching devices with details using optimized database function...');
  console.time('fetchDevicesWithDetails');
  
  try {
    // Use the corrected database function
    const { data, error } = await supabaseAdmin.rpc('get_devices_with_details', {
      user_id_param: userId,
      is_admin_param: isAdmin,
      is_superadmin_param: isSuperAdmin
    });

    if (error) {
      console.error("Error calling get_devices_with_details:", error);
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

    console.timeEnd('fetchDevicesWithDetails');
    console.log(`✅ Successfully fetched ${devices.length} devices with details in single optimized query`);
    console.log('📊 Performance: Single database call vs multiple calls - significant improvement!');
    
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
  console.time('fallbackToLegacyApproach');
  
  try {
    if (isSuperAdmin) {
      const legacyDevices = await fetchSuperAdminDevices();
      const devices = legacyDevices.map(device => ({
        device_code: device.device_code,
        updated_at: device.updated_at,
        display_name: device.device_code
      }));
      console.timeEnd('fallbackToLegacyApproach');
      console.log('⚠️ Used legacy approach (multiple queries)');
      return devices;
    } else {
      const legacyDevices = await fetchUserDevices(userId, isAdmin);
      const devices = legacyDevices.map(device => ({
        device_code: device.device_code,
        updated_at: device.updated_at,
        display_name: device.device_code
      }));
      console.timeEnd('fallbackToLegacyApproach');
      console.log('⚠️ Used legacy approach (multiple queries)');
      return devices;
    }
  } catch (fallbackError) {
    console.error('Even fallback approach failed:', fallbackError);
    return [];
  }
};
