import { supabase } from "@/integrations/supabase/client";
import { User } from "../types";

// Search for users by email
export const searchUsersByEmail = async (searchEmail: string, deviceCode: string): Promise<User[]> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  console.log("Searching for email:", searchEmail);

  // Search for the user by email
  const { data: userData, error: userError } = await supabase
    .from('profiles')
    .select('id, email')
    .ilike('email', `%${searchEmail.trim()}%`)
    .limit(10);
    
  if (userError) {
    console.error("Error searching for user:", userError);
    throw new Error("Cannot search for users");
  }
  
  console.log("Found users in profiles:", userData);
  
  if (!userData || userData.length === 0) {
    console.log("No users found in profiles table");
    return [];
  }
  
  // Check if users have any roles (including waiting_list)
  const userIds = userData.map(u => u.id);
  const { data: userRoleUsers, error: userRoleError } = await supabase
    .from('user_roles')
    .select('user_id, role')
    .in('user_id', userIds);
    
  if (userRoleError) {
    console.error("Error checking user roles:", userRoleError);
  }
  
  console.log("User roles found:", userRoleUsers);
  
  // Create a set of user IDs with any roles (including waiting_list)
  const userRoleUserIds = new Set(userRoleUsers?.map(u => u.user_id) || []);
  
  // Include users who have any role (including waiting_list)
  const filteredUsers = userData.filter(u => userRoleUserIds.has(u.id));
  
  console.log("Filtered users with roles:", filteredUsers);
  
  if (filteredUsers.length === 0) {
    console.log("No users found with any roles");
    return [];
  }
  
  // Fetch device access records for found users
  const filteredUserIds = filteredUsers.map(u => u.id);
  const { data: accessData, error: accessError } = await supabase
    .from('user_device_access')
    .select('user_id')
    .eq('device_code', deviceCode)
    .in('user_id', filteredUserIds);
    
  if (accessError) {
    console.error("Error fetching device access:", accessError);
    throw new Error("Cannot fetch device access");
  }
  
  // Create a set of user IDs with access
  const userIdsWithAccess = new Set(accessData?.map(record => record.user_id) || []);
  
  // Combine the data
  const result = filteredUsers.map(u => ({
    id: u.id,
    email: u.email || "ไม่มีอีเมล",
    hasAccess: userIdsWithAccess.has(u.id)
  }));
  
  console.log("Final search result:", result);
  return result;
};

// Toggle device access for a user
export const toggleUserDeviceAccess = async (
  userId: string, 
  deviceCode: string, 
  currentAccess: boolean
): Promise<boolean> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  try {
    if (currentAccess) {
      // Remove access
      const { error } = await supabase
        .from('user_device_access')
        .delete()
        .eq('user_id', userId)
        .eq('device_code', deviceCode);
        
      if (error) {
        console.error("Error removing device access:", error);
        return false;
      }
    } else {
      // Grant access
      const { error } = await supabase
        .from('user_device_access')
        .insert({
          user_id: userId,
          device_code: deviceCode,
          created_by: user.id
        });
        
      if (error) {
        console.error("Error granting device access:", error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Unexpected error:", error);
    return false;
  }
};

// Load users with their device access status
export const loadUsersWithAccess = async (deviceCode: string): Promise<User[]> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  // Get current user's role to determine what users they can see
  const { data: currentUserRoles, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);
    
  if (roleError) {
    console.error("Error fetching current user roles:", roleError);
    throw new Error("Cannot fetch user roles");
  }
  
  const userRoles = currentUserRoles?.map(r => r.role) || [];
  const isSuperAdmin = userRoles.includes('superadmin');
  const isAdmin = userRoles.includes('admin');
  
  try {
    // Determine which roles the current user can see
    let allowedRoles: ('user' | 'admin' | 'superadmin')[] = [];
    if (isSuperAdmin) {
      // Super admin sees all roles
      allowedRoles = ['user', 'admin', 'superadmin'];
    } else if (isAdmin) {
      // Admin sees users and other admins, but not superadmins
      allowedRoles = ['user', 'admin'];
    } else {
      // Regular users see only other users
      allowedRoles = ['user'];
    }
    
    // Fetch users with the allowed roles
    const { data: userRoleUsers, error: userRoleError } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .in('role', allowedRoles);
      
    if (userRoleError) {
      console.error("Error fetching user roles:", userRoleError);
      throw new Error("Cannot fetch user roles");
    }
    
    const userRoleUserIds = userRoleUsers?.map(u => u.user_id) || [];
    
    if (userRoleUserIds.length === 0) {
      return [];
    }
    
    // Fetch user profiles
    const { data: usersData, error: usersError } = await supabase
      .from('profiles')
      .select('id, email')
      .in('id', userRoleUserIds)
      .order('email');
      
    if (usersError) {
      console.error("Error fetching users:", usersError);
      throw new Error("Cannot fetch users");
    }
    
    // Create a map of user roles
    const userRoleMap = new Map(userRoleUsers?.map(ur => [ur.user_id, ur.role]) || []);
    
    // Fetch explicit device access records for this device
    const { data: accessData, error: accessError } = await supabase
      .from('user_device_access')
      .select('user_id')
      .eq('device_code', deviceCode)
      .in('user_id', userRoleUserIds);
      
    if (accessError) {
      console.error("Error fetching device access:", accessError);
      throw new Error("Cannot fetch device access");
    }
    
    // Create a set of user IDs with explicit access
    const userIdsWithExplicitAccess = new Set(accessData?.map(record => record.user_id) || []);
    
    // Combine the data
    return usersData?.map(userData => {
      const userRole = userRoleMap.get(userData.id);
      // Admin and superadmin have implicit access to all devices
      const hasImplicitAccess = userRole === 'admin' || userRole === 'superadmin';
      const hasExplicitAccess = userIdsWithExplicitAccess.has(userData.id);
      
      return {
        id: userData.id,
        email: userData.email || "ไม่มีอีเมล",
        hasAccess: hasImplicitAccess || hasExplicitAccess,
        role: userRole,
        hasImplicitAccess
      };
    }) || [];
  } catch (error) {
    console.error("Unexpected error:", error);
    throw error;
  }
};
