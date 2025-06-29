
import { supabase } from "@/integrations/supabase/client";

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
