
import { useEffect, ReactNode, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthContext } from "./auth/AuthContext";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserRoles } from "@/hooks/useUserRoles";

// Re-export for backward compatibility
export { useAuth } from "./auth/AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const {
    user,
    setUser,
    session,
    setSession,
    isLoading,
    setIsLoading,
    signOut,
    validateAndRefreshSession,
  } = useAuthSession();

  const {
    userRoles,
    setUserRoles,
    fetchUserRoles,
  } = useUserRoles();

  // Auth readiness and stability tracking
  const isAuthReady = useRef<boolean>(false);
  const initializationStartTime = useRef<number>(Date.now());
  const sessionInitialized = useRef<boolean>(false);
  
  // Session stability tracking
  const lastSessionValidation = useRef<number>(0);
  const sessionValidationCount = useRef<number>(0);
  const authStateChangeCount = useRef<number>(0);
  const lastAuthStateChange = useRef<number>(Date.now());
  
  // Session validation throttling - REDUCED FREQUENCY
  const SESSION_VALIDATION_INTERVAL = 120000; // 120 seconds (2 minutes) instead of 30s
  const MAX_VALIDATIONS_PER_MINUTE = 2; // Reduced from 3 to 2
  const AUTH_STABILITY_DELAY = 200; // Reduced from 1000ms to 200ms

  // Simplified session validation with debouncing
  const throttledValidateSession = useCallback(async (currentSession: any) => {
    const now = Date.now();
    
    // Aggressive debouncing to prevent rapid calls
    if (now - lastSessionValidation.current < SESSION_VALIDATION_INTERVAL) {
      console.log(`⏭️ Session validation debounced (${Math.round((now - lastSessionValidation.current) / 1000)}s since last)`);
      return currentSession;
    }
    
    console.log(`🔍 Session validation (${sessionValidationCount.current + 1})`);
    
    try {
      const validSession = await validateAndRefreshSession(currentSession);
      lastSessionValidation.current = now;
      sessionValidationCount.current++;
      
      return validSession;
    } catch (error) {
      console.error('Session validation failed:', error);
      return currentSession;
    }
  }, [validateAndRefreshSession]);

  // Natural loading completion without forced delays
  const checkAndCompleteLoading = useCallback(async () => {
    const now = Date.now();
    const elapsedTime = now - initializationStartTime.current;
    
    console.log(`🕐 Auth completing naturally: elapsed=${elapsedTime}ms`);
    
    // Only minimal stability delay
    if (elapsedTime < AUTH_STABILITY_DELAY) {
      const remainingTime = AUTH_STABILITY_DELAY - elapsedTime;
      console.log(`⏱️ Auth stability delay: ${remainingTime}ms`);
      await new Promise(resolve => setTimeout(resolve, remainingTime));
    }
    
    // Mark auth as ready and complete loading
    if (sessionInitialized.current && !isAuthReady.current) {
      console.log(`✅ Auth ready after ${Date.now() - initializationStartTime.current}ms`);
      isAuthReady.current = true;
      setIsLoading(false);
    }
  }, [setIsLoading]);

  useEffect(() => {
    console.log("🚀 Setting up AuthProvider with enhanced initialization");
    setIsLoading(true);
    initializationStartTime.current = Date.now();
    isAuthReady.current = false;
    sessionInitialized.current = false;

    // Set up auth state listener with stability enhancement
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        const now = Date.now();
        authStateChangeCount.current++;
        
        console.log(`🔄 Auth state changed, event: ${event} (change #${authStateChangeCount.current})`);
        
        // Minimal debouncing for auth state changes
        const timeSinceLastChange = now - lastAuthStateChange.current;
        if (timeSinceLastChange < AUTH_STABILITY_DELAY) {
          console.log(`⏭️ Auth state debounced (${timeSinceLastChange}ms)`);
          await new Promise(resolve => setTimeout(resolve, AUTH_STABILITY_DELAY - timeSinceLastChange));
        }
        
        lastAuthStateChange.current = now;
        
        // Throttled session validation
        const validSession = await throttledValidateSession(currentSession);
        
        // Update session and user state with the validated session
        setSession(validSession);
        setUser(validSession?.user ?? null);
        
        // If user is logged in, fetch roles from database
        if (validSession?.user) {
          try {
            const roles = await fetchUserRoles(validSession.user.id);
            console.log("Setting user roles after auth change:", roles);
            setUserRoles(roles);
          } catch (error) {
            console.error("Error fetching roles during auth change:", error);
            setUserRoles([]);
          }
        } else {
          setUserRoles([]);
        }
        
        // Mark session as initialized (but don't complete loading yet)
        if (!sessionInitialized.current) {
          sessionInitialized.current = true;
          console.log("📋 Session initialization marked complete");
          
          // Check if we can complete loading now
          checkAndCompleteLoading();
        }
      }
    );

    // Initial session check with enhanced error handling
    const initializeAuth = async () => {
      console.log("🔍 Initializing auth - checking existing session");
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        // Handle session retrieval errors
        if (error) {
          console.warn('⚠️ Warning fetching session:', error);
          
          // Critical auth errors that require sign out
          if (error.message?.includes('invalid_grant') || 
              error.message?.includes('token_expired')) {
            console.log('🚨 Critical auth error detected, signing out...');
            await supabase.auth.signOut();
            setUser(null);
            setSession(null);
            setUserRoles([]);
            sessionInitialized.current = true;
            checkAndCompleteLoading();
            return;
          }
          
          // Non-critical errors - continue with current state
          console.log('📝 Non-critical auth error, continuing with current state');
        }
        
        console.log("📦 Initial session retrieved:", !!initialSession);
        
        // Enhanced initial session validation with throttling
        const validSession = await throttledValidateSession(initialSession);
        
        // Update session and user state immediately
        setSession(validSession);
        setUser(validSession?.user ?? null);
        
        // If user is logged in, fetch roles from database
        if (validSession?.user) {
          console.log("👤 User is logged in, fetching roles");
          const roles = await fetchUserRoles(validSession.user.id);
          console.log("🏷️ Setting initial user roles:", roles);
          setUserRoles(roles);
        }
        
        // Mark session as initialized
        sessionInitialized.current = true;
        console.log("✅ Initial session check complete");
        
        // Check if we can complete loading now
        checkAndCompleteLoading();
        
      } catch (error) {
        console.warn('⚠️ Warning checking session:', error);
        
        // Handle session check failure gracefully
        console.log('📝 Session check failed, but keeping current auth state');
        setUser(null);
        setSession(null);
        setUserRoles([]);
        sessionInitialized.current = true;
        checkAndCompleteLoading();
      }
    };

    // Run initialization after setting up listener
    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [throttledValidateSession, fetchUserRoles, checkAndCompleteLoading]);

  const handleSignOut = async () => {
    await signOut();
    setUserRoles([]);
    // Reset auth readiness on sign out
    isAuthReady.current = false;
    sessionInitialized.current = false;
  };

  const value = {
    user,
    session,
    userRoles,
    isLoading,
    signOut: handleSignOut,
    // Export auth readiness for child components
    isAuthReady: isAuthReady.current,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
