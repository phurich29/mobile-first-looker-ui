
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
