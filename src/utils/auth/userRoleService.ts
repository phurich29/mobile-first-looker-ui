import { supabase } from "@/integrations/supabase/client";
import { roleCache } from "./roleCache";

type UserRole = 'admin' | 'superadmin' | 'user';

interface UserRoleService {
  getUserRoles(userId: string, forceRefresh?: boolean): Promise<UserRole[]>;
  getUsersWithRoles(userIds: string[]): Promise<Record<string, UserRole[]>>;
  invalidateUserCache(userId: string): void;
  clearAllCache(): void;
}

class UserRoleServiceImpl implements UserRoleService {
  /**
   * Get roles for a single user with caching
   */
  async getUserRoles(userId: string, forceRefresh: boolean = false): Promise<UserRole[]> {
    try {
      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cachedRoles = roleCache.get(userId);
        if (cachedRoles !== null) {
          console.log("🎯 Using cached roles for user:", userId, cachedRoles);
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
      
      const roles = (data || []) as UserRole[];
      console.log("✅ Roles retrieved from database:", roles);
      
      // Cache the result
      roleCache.set(userId, roles);
      
      return roles;
    } catch (error) {
      console.error('❌ Error in getUserRoles:', error);
      return [];
    }
  }

  /**
   * Get roles for multiple users efficiently with batch caching
   */
  async getUsersWithRoles(userIds: string[]): Promise<Record<string, UserRole[]>> {
    const result: Record<string, UserRole[]> = {};
    const uncachedUserIds: string[] = [];

    // First, check cache for all users
    for (const userId of userIds) {
      const cachedRoles = roleCache.get(userId);
      if (cachedRoles !== null) {
        result[userId] = cachedRoles;
        console.log("🎯 Using cached roles for user:", userId);
      } else {
        uncachedUserIds.push(userId);
      }
    }

    // Fetch roles for uncached users in parallel
    if (uncachedUserIds.length > 0) {
      console.log("🔄 Fetching roles from database for users:", uncachedUserIds);
      
      const rolePromises = uncachedUserIds.map(async (userId) => {
        try {
          const { data, error } = await supabase.rpc('get_user_roles', {
            user_id: userId
          });

          if (error) {
            console.error(`❌ Error fetching roles for user ${userId}:`, error);
            return { userId, roles: [] as UserRole[] };
          }

          const roles = (data || []) as UserRole[];
          console.log(`✅ Roles retrieved for user ${userId}:`, roles);
          
          // Cache the result
          roleCache.set(userId, roles);
          
          return { userId, roles };
        } catch (error) {
          console.error(`❌ Error fetching roles for user ${userId}:`, error);
          return { userId, roles: [] as UserRole[] };
        }
      });

      const roleResults = await Promise.all(rolePromises);
      
      // Add results to the final result object
      roleResults.forEach(({ userId, roles }) => {
        result[userId] = roles;
      });
    }

    return result;
  }

  /**
   * Invalidate cache for a specific user
   */
  invalidateUserCache(userId: string): void {
    // For now, we'll clear the entire cache since our current cache structure
    // is global. In a more sophisticated implementation, we could store per-user cache.
    roleCache.clear();
    console.log("🗑️ Invalidated roles cache for user:", userId);
  }

  /**
   * Clear all cached roles
   */
  clearAllCache(): void {
    roleCache.clear();
    console.log("🗑️ Cleared all roles cache");
  }
}

// Export singleton instance
export const userRoleService = new UserRoleServiceImpl();

// Export for backward compatibility
export const getUserRoles = userRoleService.getUserRoles.bind(userRoleService);
export const getUsersWithRoles = userRoleService.getUsersWithRoles.bind(userRoleService);