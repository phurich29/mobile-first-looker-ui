
import { supabaseAdmin } from "@/integrations/supabase/client";
import { REQUIRED_DEVICE_CODES } from "./constants";
import { fetchSuperAdminDevices } from "./legacyDeviceService";

/**
 * Counts total unique devices using the optimized database function
 */
export const countUniqueDevices = async () => {
  console.log('Counting unique devices using optimized function...');
  
  try {
    // Use the database function to get accurate count - both admin and superadmin get full access
    const { data, error } = await supabaseAdmin.rpc('get_devices_with_details', {
      user_id_param: null,
      is_admin_param: true,
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
