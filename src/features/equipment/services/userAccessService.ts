
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { User } from "../types";

// Search for users by email
export const searchUsersByEmail = async (searchEmail: string, deviceCode: string): Promise<User[]> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

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
  
  if (!userData || userData.length === 0) {
    return [];
  }
  
  // Check if users have proper roles (user, admin, or superadmin) - no more waiting_list checking
  const userIds = userData.map(u => u.id);
  const { data: userRoleUsers, error: userRoleError } = await supabase
    .from('user_roles')
    .select('user_id, role')
    .in('user_id', userIds)
    .in('role', ['user', 'admin', 'superadmin']);
    
  if (userRoleError) {
    console.error("Error checking user roles:", userRoleError);
  }
  
  // Create a set of user IDs with proper roles
  const userRoleUserIds = new Set(userRoleUsers?.map(u => u.user_id) || []);
  
  // Filter to only include users with proper roles
  const filteredUsers = userData.filter(u => userRoleUserIds.has(u.id));
  
  if (filteredUsers.length === 0) {
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
  return filteredUsers.map(u => ({
    id: u.id,
    email: u.email || "ไม่มีอีเมล",
    hasAccess: userIdsWithAccess.has(u.id)
  }));
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
  
  // Get current user's roles to determine what users they can see
  const { data: currentUserRoles, error: currentUserRolesError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);
    
  if (currentUserRolesError) {
    console.error("Error fetching current user roles:", currentUserRolesError);
    throw new Error("Cannot fetch current user roles");
  }
  
  const userRoles = currentUserRoles?.map(r => r.role) || [];
  const isSuperAdmin = userRoles.includes('superadmin');
  const isAdmin = userRoles.includes('admin');
  
  try {
    // Determine which roles the current user can see based on strict rules
    let allowedRoles: ('user' | 'admin' | 'superadmin')[] = [];
    if (isSuperAdmin) {
      // Super admin sees all: user, admin, superadmin
      allowedRoles = ['user', 'admin', 'superadmin'];
    } else if (isAdmin) {
      // Admin sees all except superadmin: user, admin only
      allowedRoles = ['user', 'admin'];
    } else {
      // Regular user sees only other users
      allowedRoles = ['user'];
    }
    
    // Fetch all users with allowed roles
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
    
    // Fetch profile data for these users
    const { data: usersData, error: usersError } = await supabase
      .from('profiles')
      .select('id, email')
      .in('id', userRoleUserIds)
      .order('email');
      
    if (usersError) {
      console.error("Error fetching users:", usersError);
      throw new Error("Cannot fetch users");
    }
    
    // Fetch device access records for this device
    const { data: accessData, error: accessError } = await supabase
      .from('user_device_access')
      .select('user_id')
      .eq('device_code', deviceCode);
      
    if (accessError) {
      console.error("Error fetching device access:", accessError);
      throw new Error("Cannot fetch device access");
    }
    
    // Create a set of user IDs with explicit access
    const userIdsWithExplicitAccess = new Set(accessData?.map(record => record.user_id) || []);
    
    // Create a map of user roles for quick lookup
    const userRoleMap = new Map();
    userRoleUsers?.forEach(ur => {
      if (!userRoleMap.has(ur.user_id)) {
        userRoleMap.set(ur.user_id, []);
      }
      userRoleMap.get(ur.user_id).push(ur.role);
    });
    
    // Combine the data and determine access
    return usersData?.map(userData => {
      const roles = userRoleMap.get(userData.id) || [];
      const isUserAdmin = roles.includes('admin');
      const isUserSuperAdmin = roles.includes('superadmin');
      
      // Admin and Super Admin have implicit access to all devices
      const hasImplicitAccess = isUserAdmin || isUserSuperAdmin;
      const hasExplicitAccess = userIdsWithExplicitAccess.has(userData.id);
      
      return {
        id: userData.id,
        email: userData.email || "ไม่มีอีเมล",
        hasAccess: hasImplicitAccess || hasExplicitAccess
      };
    }) || [];
  } catch (error) {
    console.error("Unexpected error:", error);
    throw error;
  }
};
