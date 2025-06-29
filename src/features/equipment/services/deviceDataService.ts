
import { supabase } from "@/integrations/supabase/client";
import { DeviceInfo } from "../types";

export const fetchDevicesWithDetails = async (userId?: string, isAdmin?: boolean, isSuperAdmin?: boolean): Promise<DeviceInfo[]> => {
  console.log("Fetching devices with details using optimized database function...");
  
  try {
    // Get current user if not provided
    let currentUserId = userId;
    let currentUser = null;
    
    if (!currentUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No authenticated user found");
        return [];
      }
      currentUserId = user.id;
      currentUser = user;
    }

    // Check user role if not provided
    let userIsSuperAdmin = isSuperAdmin;
    let userIsAdmin = isAdmin;
    
    if (userIsSuperAdmin === undefined || userIsAdmin === undefined) {
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUserId);

      userIsSuperAdmin = userRoles?.some(role => role.role === 'superadmin') || false;
      userIsAdmin = userRoles?.some(role => role.role === 'admin') || false;
    }

    console.log(`User roles - isSuperAdmin: ${userIsSuperAdmin}, isAdmin: ${userIsAdmin}`);

    let devices: DeviceInfo[] = [];

    if (userIsSuperAdmin) {
      // Super admin sees all devices using database function
      console.log("Fetching devices for SuperAdmin using database function...");
      const { data, error } = await supabase.rpc('get_devices_with_details', {
        user_id_param: currentUserId,
        is_admin_param: true,
        is_superadmin_param: true
      });
      if (error) {
        console.error("Error from database function:", error);
        throw error;
      }
      devices = data || [];
      console.log(`SuperAdmin: Found ${devices.length} devices from database function`);
    } else if (userIsAdmin) {
      // Regular admin sees devices they have access to OR devices in guest_device_access
      console.log("Fetching devices for Admin...");
      
      const { data: accessibleDevices, error: accessError } = await supabase
        .from('user_device_access')
        .select('device_code')
        .eq('user_id', currentUserId);

      if (accessError) throw accessError;

      const { data: guestDevices, error: guestError } = await supabase
        .from('guest_device_access')
        .select('device_code');

      if (guestError) throw guestError;

      // Combine accessible devices and guest devices
      const allAccessibleDeviceCodes = [
        ...(accessibleDevices?.map(d => d.device_code) || []),
        ...(guestDevices?.map(d => d.device_code) || [])
      ];

      const uniqueDeviceCodes = [...new Set(allAccessibleDeviceCodes)];
      console.log(`Admin: Found ${uniqueDeviceCodes.length} accessible device codes`);

      if (uniqueDeviceCodes.length > 0) {
        // Use database function and filter results
        const { data, error } = await supabase.rpc('get_devices_with_details', {
          user_id_param: currentUserId,
          is_admin_param: true,
          is_superadmin_param: false
        });
        if (error) throw error;
        
        // Filter to only show devices they have access to
        devices = (data || []).filter(device => 
          uniqueDeviceCodes.includes(device.device_code)
        );
      }
      console.log(`Admin: Filtered to ${devices.length} devices`);
    } else {
      // Regular users see devices they have access to OR devices in guest_device_access that are enabled
      console.log("Fetching devices for regular user...");
      
      const { data: accessibleDevices, error: accessError } = await supabase
        .from('user_device_access')
        .select('device_code')
        .eq('user_id', currentUserId);

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

      const uniqueDeviceCodes = [...new Set(allAccessibleDeviceCodes)];
      console.log(`Regular user: Found ${uniqueDeviceCodes.length} accessible device codes`);

      if (uniqueDeviceCodes.length > 0) {
        // Use database function and filter results
        const { data, error } = await supabase.rpc('get_devices_with_details', {
          user_id_param: currentUserId,
          is_admin_param: false,
          is_superadmin_param: false
        });
        if (error) throw error;
        
        // Filter to only show devices they have access to
        devices = (data || []).filter(device => 
          uniqueDeviceCodes.includes(device.device_code)
        );
      }
      console.log(`Regular user: Filtered to ${devices.length} devices`);
    }

    console.log(`✅ Successfully fetched ${devices.length} devices with details`);
    console.log("Device codes found:", devices.map(d => d.device_code));
    
    return devices;
  } catch (error) {
    console.error("❌ Error fetching devices with details:", error);
    return [];
  }
};

export const fetchDeviceCount = async (): Promise<number> => {
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

    if (isSuperAdmin) {
      // Super admin sees all devices
      const { data, error } = await supabase.rpc('get_devices_with_details');
      if (error) throw error;
      count = data?.length || 0;
    } else if (isAdmin) {
      // Regular admin sees devices they have access to OR devices in guest_device_access
      const { data: accessibleDevices, error: accessError } = await supabase
        .from('user_device_access')
        .select('device_code')
        .eq('user_id', user.id);

      if (accessError) throw accessError;

      const { data: guestDevices, error: guestError } = await supabase
        .from('guest_device_access')
        .select('device_code');

      if (guestError) throw guestError;

      // Combine accessible devices and guest devices
      const allAccessibleDeviceCodes = [
        ...(accessibleDevices?.map(d => d.device_code) || []),
        ...(guestDevices?.map(d => d.device_code) || [])
      ];

      count = new Set(allAccessibleDeviceCodes).size;
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

    console.log(`Found ${count} unique devices using optimized function`);
    return count;
  } catch (error) {
    console.error("❌ Error counting devices:", error);
    return 0;
  }
};
