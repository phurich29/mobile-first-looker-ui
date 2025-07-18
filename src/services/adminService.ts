import { supabase } from "@/integrations/supabase/client";

// Admin operations using RLS bypass for specific functions
class AdminService {
  // Get all users (for user management)
  async getAllUsers() {
    // This requires superadmin RLS policy
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  }

  // Get all devices (for device management)
  async getAllDevices() {
    // Use function that bypasses RLS for admin operations
    const { data, error } = await supabase
      .rpc('get_devices_with_details', {
        user_id_param: null,
        is_admin_param: false,
        is_superadmin_param: true
      });
      
    if (error) throw error;
    return data;
  }

  // Create user (admin function)
  async createUser(userData: any) {
    // Direct auth operation - requires proper RLS
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });
    
    if (error) throw error;
    return data;
  }

  // Update user roles
  async updateUserRoles(userId: string, roles: string[]) {
    // Delete existing roles
    await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    // Insert new roles
    const roleInserts = roles.map(role => ({
      user_id: userId,
      role: role as any
    }));

    const { error } = await supabase
      .from('user_roles')
      .insert(roleInserts);

    if (error) throw error;
  }

  // Delete user
  async deleteUser(userId: string) {
    // Delete from profiles (cascades to other tables)
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) throw error;
  }
}

export const adminService = new AdminService();