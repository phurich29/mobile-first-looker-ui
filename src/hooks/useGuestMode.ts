
import { useAuth } from '@/components/AuthProvider';
import { useState, useEffect, useCallback } from 'react';

export const useGuestMode = () => {
  const { user, userRoles, isLoading } = useAuth();
  
  // State management for stable detection
  const [stableGuestState, setStableGuestState] = useState<boolean | null>(null);
  const [stateChangeCount, setStateChangeCount] = useState(0);
  const [lastStateChange, setLastStateChange] = useState(Date.now());
  
  // Debounce timer for stability
  const STABILITY_DELAY = 500; // 500ms delay to ensure stable state
  const MAX_RAPID_CHANGES = 3; // Maximum rapid changes before blocking
  const RAPID_CHANGE_WINDOW = 2000; // 2 seconds window
  
  // Detect rapid auth state changes
  const detectRapidChanges = useCallback(() => {
    const now = Date.now();
    const timeSinceLastChange = now - lastStateChange;
    
    if (timeSinceLastChange < RAPID_CHANGE_WINDOW) {
      setStateChangeCount(prev => prev + 1);
    } else {
      setStateChangeCount(1);
    }
    
    setLastStateChange(now);
    
    // Block rapid changes
    if (stateChangeCount >= MAX_RAPID_CHANGES) {
      console.warn(`🚫 Rapid auth state changes detected (${stateChangeCount}), blocking for stability`);
      return false;
    }
    
    return true;
  }, [lastStateChange, stateChangeCount]);
  
  // Calculate current guest state with stability detection
  useEffect(() => {
    if (isLoading) {
      // Don't update state while loading
      return;
    }
    
    const currentGuestState = !user && !isLoading;
    
    // Check if state has actually changed
    if (stableGuestState === currentGuestState) {
      return;
    }
    
    // Check for rapid changes
    if (!detectRapidChanges()) {
      return;
    }
    
    console.log(`🔄 Guest state changing: ${stableGuestState} → ${currentGuestState}`);
    
    // Set state with debouncing for stability
    const timeoutId = setTimeout(() => {
      setStableGuestState(currentGuestState);
      console.log(`✅ Guest state stabilized: ${currentGuestState}`);
    }, STABILITY_DELAY);
    
    return () => clearTimeout(timeoutId);
  }, [user, isLoading, stableGuestState, detectRapidChanges]);
  
  // Reset rapid change counter periodically
  useEffect(() => {
    const resetInterval = setInterval(() => {
      setStateChangeCount(0);
    }, RAPID_CHANGE_WINDOW * 2);
    
    return () => clearInterval(resetInterval);
  }, []);
  
  // Use stable state, fallback to calculated state for first load
  const isGuest = stableGuestState !== null ? stableGuestState : (!user && !isLoading);
  const isAuthenticated = !!user;
  
  return {
    isGuest,
    isAuthenticated,
    user,
    userRoles,
    isLoading,
    // Additional stability info for debugging
    isStable: stableGuestState !== null,
    stateChangeCount,
    lastStateChange
  };
};
