
import { useAuth } from '@/components/AuthProvider';
import { useState, useEffect, useCallback } from 'react';

export const useGuestMode = () => {
  const { user, userRoles, isLoading } = useAuth();
  
  // State management for stable detection
  const [stableGuestState, setStableGuestState] = useState<boolean | null>(null);
  const [stateChangeCount, setStateChangeCount] = useState(0);
  const [lastStateChange, setLastStateChange] = useState(Date.now());
  
  // Debounce timer for stability with longer delay for post-refresh
  const STABILITY_DELAY = 1500; // 1.5s delay for post-refresh scenarios
  const POST_REFRESH_DELAY = 2500; // 2.5s for suspected post-refresh cases
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
  
  // Calculate current guest state with enhanced stability detection
  useEffect(() => {
    // Always wait for auth to finish loading first
    if (isLoading) {
      console.log('🔄 Auth still loading, waiting...');
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
    
    // Detect post-refresh scenario (rapid state change after load)
    const isPostRefresh = stateChangeCount >= 2 && (Date.now() - lastStateChange) < 3000;
    const delayToUse = isPostRefresh ? POST_REFRESH_DELAY : STABILITY_DELAY;
    
    console.log(`🔄 Guest state changing: ${stableGuestState} → ${currentGuestState} (delay: ${delayToUse}ms, post-refresh: ${isPostRefresh})`);
    
    // Set state with adaptive debouncing for stability
    const timeoutId = setTimeout(() => {
      // Double check auth state hasn't changed during timeout
      if (isLoading) {
        console.log('⚠️ Auth loading during timeout, skipping state update');
        return;
      }
      
      const finalState = !user && !isLoading;
      setStableGuestState(finalState);
      console.log(`✅ Guest state stabilized: ${finalState} (after ${delayToUse}ms)`);
    }, delayToUse);
    
    return () => clearTimeout(timeoutId);
  }, [user, isLoading, stableGuestState, detectRapidChanges, stateChangeCount, lastStateChange]);
  
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
