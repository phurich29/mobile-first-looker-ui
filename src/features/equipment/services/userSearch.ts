
import { supabase } from "@/integrations/supabase/client";
import { User } from "../types";

// Search for users by email
export const searchUsersByEmail = async (searchEmail: string, deviceCode: string): Promise<User[]> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  console.log("🔍 Searching for email:", searchEmail);

  // Search for the user by email
  const { data: userData, error: userError } = await supabase
    .from('profiles')
    .select('id, email')
    .ilike('email', `%${searchEmail.trim()}%`)
    .limit(10);
    
  if (userError) {
    console.error("❌ Error searching for user:", userError);
    throw new Error("Cannot search for users");
  }
  
  console.log("📋 Found users in profiles:", userData);
  
  if (!userData || userData.length === 0) {
    console.log("⚠️ No users found in profiles table for email:", searchEmail);
    
    // Let's also check if there are any profiles at all
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('id, email')
      .limit(5);
    
    console.log("📊 Sample of all profiles in database:", allProfiles);
    if (allError) {
      console.error("❌ Error fetching sample profiles:", allError);
    }
    
    return [];
  }
  
  // Check user roles for found users
  const userIds = userData.map(u => u.id);
  console.log("🔎 Checking roles for user IDs:", userIds);
  
  const { data: userRoleUsers, error: userRoleError } = await supabase
    .from('user_roles')
    .select('user_id, role')
    .in('user_id', userIds);
    
  if (userRoleError) {
    console.error("❌ Error checking user roles:", userRoleError);
  }
  
  console.log("👥 User roles found:", userRoleUsers);
  
  // Create a set of user IDs with any roles
  const userRoleUserIds = new Set(userRoleUsers?.map(u => u.user_id) || []);
  
  // Include users who have any role OR users without roles (new users)
  // Let's be more permissive and include all found users for now
  const filteredUsers = userData; // Include all found users regardless of roles
  
  console.log("✅ Users to process (after role filtering):", filteredUsers);
  
  if (filteredUsers.length === 0) {
    console.log("⚠️ No users found after role filtering");
    return [];
  }
  
  // Fetch device access records for found users
  const filteredUserIds = filteredUsers.map(u => u.id);
  console.log("🔐 Checking device access for user IDs:", filteredUserIds, "device:", deviceCode);
  
  const { data: accessData, error: accessError } = await supabase
    .from('user_device_access')
    .select('user_id')
    .eq('device_code', deviceCode)
    .in('user_id', filteredUserIds);
    
  if (accessError) {
    console.error("❌ Error fetching device access:", accessError);
    throw new Error("Cannot fetch device access");
  }
  
  console.log("🔓 Device access data:", accessData);
  
  // Create a set of user IDs with access
  const userIdsWithAccess = new Set(accessData?.map(record => record.user_id) || []);
  
  // Combine the data
  const result = filteredUsers.map(u => ({
    id: u.id,
    email: u.email || "ไม่มีอีเมล",
    hasAccess: userIdsWithAccess.has(u.id)
  }));
  
  console.log("🎯 Final search result:", result);
  return result;
};
