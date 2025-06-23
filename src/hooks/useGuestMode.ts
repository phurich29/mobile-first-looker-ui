
import { useAuth } from '@/components/AuthProvider';

export const useGuestMode = () => {
  const { user, userRoles, isLoading } = useAuth();
  
  const isGuest = !user && !isLoading;
  const isAuthenticated = !!user;
  
  return {
    isGuest,
    isAuthenticated,
    user,
    userRoles,
    isLoading
  };
};
