
import { supabase } from "@/integrations/supabase/client";
import { User } from "../types";

export const loadUsers = async (deviceCode: string, currentUserId?: string): Promise<User[]> => {
  if (!currentUserId) return [];
  
  try {
    // Fetch all users who are not on waiting list using direct query instead of RPC
    const { data: usersData, error: usersError } = await supabase
      .from('profiles')
      .select('id, email')
      .order('email');
      
    if (usersError) {
      console.error("Error fetching users:", usersError);
      throw new Error("Failed to fetch users");
    }
    
    // Filter out users on waiting list
    const { data: waitingListUsers, error: waitingListError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'waiting_list');
      
    if (waitingListError) {
      console.error("Error fetching waiting list users:", waitingListError);
      throw new Error("Failed to fetch waiting list users");
    }
    
    const waitingListUserIds = new Set(waitingListUsers?.map(u => u.user_id) || []);
    const filteredUsers = usersData?.filter(u => !waitingListUserIds.has(u.id)) || [];
    
    // Fetch device access records for this device
    const { data: accessData, error: accessError } = await supabase
      .from('user_device_access')
      .select('user_id')
      .eq('device_code', deviceCode);
      
    if (accessError) {
      console.error("Error fetching device access:", accessError);
      throw new Error("Failed to fetch device access data");
    }
    
    // Create a set of user IDs with access
    const userIdsWithAccess = new Set(accessData?.map(record => record.user_id) || []);
    
    // Combine the data
    const usersWithAccess = filteredUsers.map(userData => ({
      id: userData.id,
      email: userData.email || "ไม่มีอีเมล",
      hasAccess: userIdsWithAccess.has(userData.id)
    }));
    
    return usersWithAccess;
  } catch (error) {
    console.error("Unexpected error in loadUsers:", error);
    throw error;
  }
};

export const toggleAccess = async (
  userId: string, 
  deviceCode: string, 
  currentAccess: boolean, 
  currentUserId: string
): Promise<void> => {
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
        throw new Error("Failed to remove access");
      }
    } else {
      // Grant access
      const { error } = await supabase
        .from('user_device_access')
        .insert({
          user_id: userId,
          device_code: deviceCode,
          created_by: currentUserId
        });
        
      if (error) {
        console.error("Error granting device access:", error);
        throw new Error("Failed to grant access");
      }
    }
  } catch (error) {
    console.error("Error toggling access:", error);
    throw error;
  }
};
