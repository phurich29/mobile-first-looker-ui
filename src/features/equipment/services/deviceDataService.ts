
import { supabase } from "@/integrations/supabase/client";
import { DeviceInfo } from "../types";

export const fetchDevicesWithDetails = async (userId?: string, isAdmin?: boolean, isSuperAdmin?: boolean): Promise<DeviceInfo[]> => {
  console.log("Fetching devices with details - supporting visitor mode...");
  
  try {
    // ถ้าไม่มี userId แสดงว่าเป็น visitor ให้ใช้ guest device access
    if (!userId) {
      console.log("📡 Fetching visitor devices from guest_device_access");
      
      const { data, error } = await supabase.rpc('get_guest_devices_fast');
      
      if (error) {
        console.error('🚨 Visitor device fetch error:', error);
        return [];
      }

      if (!data || !Array.isArray(data)) {
        console.warn('⚠️ Invalid visitor device data:', data);
        return [];
      }

      const devices: DeviceInfo[] = data.map((item: any) => ({
        device_code: item.device_code || '',
        display_name: item.display_name || item.device_code || 'ไม่ระบุชื่อ',
        updated_at: item.updated_at || new Date().toISOString()
      }));

      console.log(`✅ Successfully fetched ${devices.length} visitor devices`);
      return devices;
    }

    // สำหรับผู้ใช้ที่ login แล้ว
    let currentUserId = userId;
    let currentUser = null;

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

    // SuperAdmin and Admin have different permissions now
    if (userIsSuperAdmin || userIsAdmin) {
      console.log(`Fetching devices for ${userIsSuperAdmin ? 'SuperAdmin' : 'Admin'} using database function...`);
      const { data, error } = await supabase.rpc('get_devices_with_details', {
        user_id_param: currentUserId,
        is_admin_param: userIsAdmin && !userIsSuperAdmin, // Only true for admin, not superadmin
        is_superadmin_param: userIsSuperAdmin // Only true for superadmin
      });
      if (error) {
        console.error("Error from database function:", error);
        throw error;
      }
      devices = data || [];
      console.log(`${userIsSuperAdmin ? 'SuperAdmin' : 'Admin'}: Found ${devices.length} devices from database function`);
    } else {
      // Regular users see only devices they have access to
      console.log("Fetching devices for regular user...");
      
      const { data: accessibleDevices, error: accessError } = await supabase
        .from('user_device_access')
        .select('device_code')
        .eq('user_id', currentUserId);

      if (accessError) throw accessError;

      const uniqueDeviceCodes = accessibleDevices?.map(d => d.device_code) || [];
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

    // SuperAdmin and Admin have different permissions
    if (isSuperAdmin || isAdmin) {
      const { data, error } = await supabase.rpc('get_devices_with_details', {
        user_id_param: user.id,
        is_admin_param: isAdmin && !isSuperAdmin, // Only true for admin, not superadmin
        is_superadmin_param: isSuperAdmin // Only true for superadmin
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

    console.log(`Found ${count} unique devices using optimized function`);
    return count;
  } catch (error) {
    console.error("❌ Error counting devices:", error);
    return 0;
  }
};
