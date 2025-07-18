
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';

export const useGuestMode = () => {
  const { user, isLoading, isAuthReady } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Immediate state resolution - no waiting
  useEffect(() => {
    // Set immediate fallback state
    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [isInitialized]);
  
  // Simple guest determination
  const isGuest = !user && !isLoading && isAuthReady;
  const isStable = isInitialized; // Simplified stability check
  
  // Log only important state changes
  useEffect(() => {
    if (isStable) {
      console.log(`👤 Guest mode: ${isGuest ? 'ENABLED' : 'DISABLED'}`);
    }
  }, [isGuest, isStable]);

  return {
    isGuest,
    isStable,
  };
};
