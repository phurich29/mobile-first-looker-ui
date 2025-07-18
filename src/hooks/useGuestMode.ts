
import { useAuth } from '@/components/AuthProvider';
import { useState, useEffect, useMemo } from 'react';

export const useGuestMode = () => {
  const { user, userRoles, isLoading, isAuthReady } = useAuth();
  
  // Simple initialization state
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Add timeout to prevent infinite waiting
  useEffect(() => {
    if (!isAuthReady || isLoading) {
      // Set timeout to prevent infinite waiting
      const timeout = setTimeout(() => {
        if (!isInitialized) {
          console.log('⚠️ useGuestMode timeout - forcing initialization');
          setIsInitialized(true);
        }
      }, 3000); // 3 second timeout
      
      return () => clearTimeout(timeout);
    }
    
    if (!isInitialized) {
      setIsInitialized(true);
      console.log(`✅ useGuestMode initialized: user=${!!user}, isGuest=${!user}`);
    }
  }, [isAuthReady, isLoading, user, isInitialized]);
  
  // Stable derived states with proper memoization
  const derivedStates = useMemo(() => {
    const isStable = isAuthReady && isInitialized;
    const isGuest = isStable && !user;
    const isAuthenticated = isStable && !!user;
    
    return { 
      isGuest, 
      isAuthenticated, 
      isStable,
      user: isStable ? user : null,
      userRoles: isStable ? userRoles : []
    };
  }, [isAuthReady, isInitialized, user, userRoles]);
  
  return {
    isGuest: derivedStates.isGuest,
    isAuthenticated: derivedStates.isAuthenticated,
    user: derivedStates.user,
    userRoles: derivedStates.userRoles,
    isLoading: isLoading || !isAuthReady,
    isStable: derivedStates.isStable,
    isAuthReady
  };
};
