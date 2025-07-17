import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';

// Progressive authentication hook with caching
export function useProgressiveAuth() {
  const { user, userRoles, isLoading: authLoading } = useAuth();

  // Cache user roles in React Query for faster access
  const {
    data: cachedRoles = userRoles,
    isLoading: rolesLoading,
  } = useQuery({
    queryKey: ['userRoles', user?.id],
    queryFn: () => Promise.resolve(userRoles),
    enabled: !!user && userRoles.length > 0,
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
    initialData: userRoles,
  });

  // Quick auth state check
  const {
    data: authState,
    isLoading: stateLoading,
  } = useQuery({
    queryKey: ['authState', user?.id],
    queryFn: async () => {
      return {
        isAuthenticated: !!user,
        isAdmin: cachedRoles.includes('admin'),
        isSuperAdmin: cachedRoles.includes('superadmin'),
        userId: user?.id,
      };
    },
    enabled: !authLoading,
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
  });

  return {
    isLoading: authLoading || rolesLoading || stateLoading,
    isAuthenticated: authState?.isAuthenticated || false,
    isAdmin: authState?.isAdmin || false,
    isSuperAdmin: authState?.isSuperAdmin || false,
    userId: authState?.userId,
    user,
    userRoles: cachedRoles,
  };
}