
import { supabase, supabaseAdmin } from "@/integrations/supabase/client";
import { User, UserRole } from "../types";

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
  
  // For each user, fetch their roles
  const usersWithRoles = await Promise.all(
    (authUsers?.users || []).map(async (authUser) => {
      const { data: roles, error: rolesError } = await supabase.rpc(
        'get_user_roles',
        { user_id: authUser.id }
      );

      if (rolesError) {
        console.error('Error fetching roles for user:', authUser.id, rolesError);
      }
      
      return {
        id: authUser.id,
        email: authUser.email || 'unknown@example.com',
        roles: roles || [],
        last_sign_in_at: authUser.last_sign_in_at
      };
    })
  );

  return usersWithRoles;
}

/**
 * Get user roles for a specific user
 */
export async function getUserRoles(userId: string) {
  const { data: roles, error } = await supabase.rpc(
    'get_user_roles',
    { user_id: userId }
  );
  
  if (error) {
    console.error('Error fetching user roles:', error);
    throw error;
  }
  
  return roles || [];
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
}

/**
 * Approve a user (add 'user' role and remove 'waiting_list' role)
 */
export async function approveUser(userId: string) {
  // First, add the 'user' role
  try {
    await addUserRole(userId, 'user');
  } catch (error: any) {
    // Ignore if role already exists
    if (!error.message?.includes('already has role')) {
      throw error;
    }
  }
  
  // Then remove the 'waiting_list' role
  await removeUserRole(userId, 'waiting_list');
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

/**
 * Get users not in waiting list
 * Note: This is a placeholder for the edge function that will be created
 */
export async function getUsersNotInWaitingList() {
  // This would call the edge function
  const { data, error } = await supabase.functions.invoke('get_users_not_in_waiting_list');
  
  if (error) throw error;
  return data;
}
