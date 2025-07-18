import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { roleCache } from "@/utils/auth/roleCache";

export const useUserRoles = () => {
  const [userRoles, setUserRoles] = useState<string[]>([]);

  // Function to fetch user roles with caching
  const fetchUserRoles = useCallback(async (userId: string, forceRefresh: boolean = false) => {
    try {
      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cachedRoles = roleCache.get(userId);
        if (cachedRoles !== null) {
          return cachedRoles;
        }
      }

      console.log("🔄 Fetching roles from database for user:", userId);
      const { data, error } = await supabase.rpc('get_user_roles', {
        user_id: userId
      });

      if (error) {
        console.error('❌ Error fetching user roles:', error);
        return [];
      }
      
      const roles = data || [];
      console.log("✅ Roles retrieved from database:", roles);
      
      // Cache the result
      roleCache.set(userId, roles);
      
      return roles;
    } catch (error) {
      console.error('❌ Error in fetchUserRoles:', error);
      return [];
    }
  }, []);

  // Clear roles cache on signout
  const clearRolesCache = useCallback(() => {
    roleCache.clear();
    setUserRoles([]);
  }, []);

  return {
    userRoles,
    setUserRoles,
    fetchUserRoles,
    clearRolesCache,
  };
};