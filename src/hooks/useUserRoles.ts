import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUserRoles = () => {
  const [userRoles, setUserRoles] = useState<string[]>([]);

  // Function to fetch user roles from the database
  const fetchUserRoles = useCallback(async (userId: string) => {
    try {
      console.log("Fetching roles for user:", userId);
      const { data, error } = await supabase.rpc('get_user_roles', {
        user_id: userId
      });

      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }
      
      console.log("Roles retrieved for user:", data);
      return data || [];
    } catch (error) {
      console.error('Error in fetchUserRoles:', error);
      return [];
    }
  }, []);

  return {
    userRoles,
    setUserRoles,
    fetchUserRoles,
  };
};