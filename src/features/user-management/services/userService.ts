
import { supabase, supabaseAdmin } from "@/integrations/supabase/client";
import { User, UserRole } from "../types";
import { userRoleService } from "@/utils/auth/userRoleService";

/**
 * Fetch all users with their roles
 */
export async function fetchUsers() {
  // Fetch all users with last sign in details
  const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (authError) {
    console.error("Auth users error:", authError);
    throw authError;
  }
  
  // Get roles for all users efficiently with batch caching
  const userIds = (authUsers?.users || []).map(user => user.id);
  const rolesMap = await userRoleService.getUsersWithRoles(userIds);

  const usersWithRoles = (authUsers?.users || []).map(authUser => ({
    id: authUser.id,
    email: authUser.email || 'unknown@example.com',
    roles: (rolesMap[authUser.id] || []) as UserRole[],
    last_sign_in_at: authUser.last_sign_in_at
  }));

  return usersWithRoles;
}

/**
 * Get user roles for a specific user
 */
export async function getUserRoles(userId: string): Promise<UserRole[]> {
  return await userRoleService.getUserRoles(userId);
}

/**
 * Add a role to a user
 */
export async function addUserRole(userId: string, role: UserRole) {
  const { error } = await supabase
    .from('user_roles')
    .insert({ 
      user_id: userId, 
      role: role 
    });
  
  if (error) {
    if (error.code === '23505') { // Unique violation - role already exists
      throw new Error(`User already has role: ${role}`);
    }
    throw error;
  }
  
  // Invalidate cache for this user
  userRoleService.invalidateUserCache(userId);
}

/**
 * Remove a role from a user
 */
export async function removeUserRole(userId: string, role: UserRole) {
  const { error } = await supabase
    .from('user_roles')
    .delete()
    .match({ user_id: userId, role: role });
  
  if (error) {
    throw error;
  }
  
  // Invalidate cache for this user
  userRoleService.invalidateUserCache(userId);
}

/**
 * Create a new user
 */
export async function createUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });
  
  if (error) throw error;
  
  if (!data.user) {
    throw new Error("ไม่สามารถสร้างผู้ใช้ได้");
  }
  
  return data.user;
}

/**
 * Add a default role to a new user
 */
export async function addDefaultRole(userId: string, role: UserRole) {
  try {
    await addUserRole(userId, role);
    return true;
  } catch (error) {
    console.error('Error assigning default role:', error);
    return false;
  }
}

/**
 * Reset user password
 */
export async function resetUserPassword(userId: string, newPassword: string) {
  const { error } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    { password: newPassword }
  );
  
  if (error) throw error;
}

/**
 * Delete a user
 */
export async function deleteUser(userId: string) {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  
  if (error) throw error;
}
