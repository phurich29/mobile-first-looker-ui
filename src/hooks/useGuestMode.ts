
import { useMemo } from 'react';
import { useAuth } from '@/components/AuthProvider';

/**
 * Simplified guest mode hook - immediate state resolution
 */
export const useGuestMode = () => {
  const { user, isLoading, isAuthReady } = useAuth();
  
  // Immediate state calculation - no delays or timeouts
  const { isGuest, isStable } = useMemo(() => {
    // Simple guest determination - no complex logic
    const guest = !user && !isLoading && isAuthReady;
    const stable = isAuthReady; // Auth ready = stable
    
    return {
      isGuest: guest,
      isStable: stable,
    };
  }, [user, isLoading, isAuthReady]);

  return {
    isGuest,
    isStable,
    user, // Return user for backward compatibility
  };
};
