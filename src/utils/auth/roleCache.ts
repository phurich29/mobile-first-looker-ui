type UserRole = 'admin' | 'superadmin' | 'user';

interface CachedRoles {
  roles: UserRole[];
  timestamp: number;
  userId: string;
}

const ROLES_CACHE_KEY = 'user_roles_cache';
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export const roleCache = {
  // Get cached roles for a user
  get(userId: string): UserRole[] | null {
    try {
      const cached = localStorage.getItem(ROLES_CACHE_KEY);
      if (!cached) return null;

      const parsedCache: CachedRoles = JSON.parse(cached);
      
      // Check if cache is for the same user and not expired
      if (parsedCache.userId !== userId) return null;
      if (Date.now() - parsedCache.timestamp > CACHE_DURATION_MS) return null;

      console.log("🔄 Using cached user roles:", parsedCache.roles);
      return parsedCache.roles;
    } catch (error) {
      console.error("Error reading roles cache:", error);
      return null;
    }
  },

  // Set cached roles for a user
  set(userId: string, roles: UserRole[]): void {
    try {
      const cacheData: CachedRoles = {
        userId,
        roles,
        timestamp: Date.now()
      };
      localStorage.setItem(ROLES_CACHE_KEY, JSON.stringify(cacheData));
      console.log("💾 Cached user roles:", roles);
    } catch (error) {
      console.error("Error setting roles cache:", error);
    }
  },

  // Clear cached roles
  clear(): void {
    try {
      localStorage.removeItem(ROLES_CACHE_KEY);
      console.log("🗑️ Cleared user roles cache");
    } catch (error) {
      console.error("Error clearing roles cache:", error);
    }
  },

  // Check if cache exists and is valid for user
  isValid(userId: string): boolean {
    const cached = this.get(userId);
    return cached !== null;
  }
};