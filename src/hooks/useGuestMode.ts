
import { useAuth } from '@/components/AuthProvider';

export const useGuestMode = () => {
  const { user, userRoles, isLoading } = useAuth();
  
  // Guest คือผู้ที่ยังไม่ได้ login และ auth ไม่ได้อยู่ในสถานะ loading
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
