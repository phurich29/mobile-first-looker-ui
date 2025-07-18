
import { useAuth } from '@/components/AuthProvider';
import { useState, useEffect } from 'react';

export const useGuestMode = () => {
  const { user, userRoles, isLoading, isAuthReady } = useAuth();
  
  // Simplified state management - wait for auth ready
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Wait for AuthProvider to be ready before determining state
  useEffect(() => {
    if (!isAuthReady || isLoading) {
      console.log(`🔄 Waiting for auth ready: isAuthReady=${isAuthReady}, isLoading=${isLoading}`);
      return;
    }
    
    // Auth is ready, we can now determine final state
    if (!isInitialized) {
      setIsInitialized(true);
      console.log(`✅ useGuestMode initialized: user=${!!user}, isGuest=${!user}`);
    }
  }, [isAuthReady, isLoading, user, isInitialized]);
  
  // Calculate states based on auth readiness
  const isGuest = isAuthReady && !isLoading && !user;
  const isAuthenticated = isAuthReady && !isLoading && !!user;
  const isStable = isAuthReady && isInitialized;
  
  // Don't expose guest/auth states until AuthProvider is ready
  if (!isAuthReady) {
    console.log(`⏳ useGuestMode waiting for AuthProvider ready signal`);
  }
  
  return {
    isGuest: isAuthReady ? isGuest : false,
    isAuthenticated: isAuthReady ? isAuthenticated : false,
    user: isAuthReady ? user : null,
    userRoles: isAuthReady ? userRoles : [],
    isLoading: isLoading || !isAuthReady,
    // Stability info for debugging
    isStable,
    isAuthReady
  };
};
