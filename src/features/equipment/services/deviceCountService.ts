
import { supabase } from "@/integrations/supabase/client";

export const countUniqueDevices = async (): Promise<number> => {
  console.log("Counting unique devices using optimized function...");
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log("No authenticated user found");
      return 0;
    }

    // Check user role
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isSuperAdmin = userRoles?.some(role => role.role === 'superadmin');
    const isAdmin = userRoles?.some(role => role.role === 'admin');

    let count = 0;

    // SuperAdmin and Admin have different permissions
    if (isSuperAdmin || isAdmin) {
      const { data, error } = await supabase.rpc('get_devices_with_details', {
        user_id_param: user.id,
        is_admin_param: isAdmin && !isSuperAdmin,
        is_superadmin_param: isSuperAdmin
      });
      if (error) throw error;
      count = data?.length || 0;
    } else {
      // Regular users see devices they have access to OR devices in guest_device_access that are enabled
      const { data: accessibleDevices, error: accessError } = await supabase
        .from('user_device_access')
        .select('device_code')
        .eq('user_id', user.id);

      if (accessError) throw accessError;

      const { data: guestDevices, error: guestError } = await supabase
        .from('guest_device_access')
        .select('device_code')
        .eq('enabled', true);

      if (guestError) throw guestError;

      // Combine accessible devices and enabled guest devices
      const allAccessibleDeviceCodes = [
        ...(accessibleDevices?.map(d => d.device_code) || []),
        ...(guestDevices?.map(d => d.device_code) || [])
      ];

      count = new Set(allAccessibleDeviceCodes).size;
    }

    console.log(`Found ${count} unique devices`);
    return count;
  } catch (error) {
    console.error("❌ Error counting devices:", error);
    return 0;
  }
};
