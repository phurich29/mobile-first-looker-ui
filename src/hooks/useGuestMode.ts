
import { useAuth } from '@/components/AuthProvider';
import { useState, useEffect, useMemo } from 'react';

export const useGuestMode = () => {
  const { user, userRoles, isLoading, isAuthReady } = useAuth();
  
  // Simple initialization state
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Wait for auth to be ready before determining final state
  useEffect(() => {
    if (!isAuthReady || isLoading) {
      console.log(`⏳ useGuestMode waiting: isAuthReady=${isAuthReady}, isLoading=${isLoading}`);
      return;
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
