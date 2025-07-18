
import { useEffect, useState, ReactNode, useCallback, useRef } from "react";
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

  // Auth ready state management
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [initializationComplete, setInitializationComplete] = useState(false);

  // Session stability tracking
  const lastSessionValidation = useRef<number>(0);
  const sessionValidationCount = useRef<number>(0);
  const authStateChangeCount = useRef<number>(0);
  const lastAuthStateChange = useRef<number>(Date.now());
  
  // Enhanced timing constants for post-refresh stability
  const SESSION_VALIDATION_INTERVAL = 30000; // 30 seconds minimum between validations
  const MAX_VALIDATIONS_PER_MINUTE = 3;
  const AUTH_STABILITY_DELAY = 1500; // 1.5 second delay for auth state changes
  const POST_REFRESH_LOADING_TIME = 3000; // 3 seconds minimum loading for post-refresh
  const INITIALIZATION_TIMEOUT = 5000; // 5 seconds max for initialization

  // Enhanced session validation with throttling
  const throttledValidateSession = useCallback(async (currentSession: any) => {
    const now = Date.now();
    
    // Check if we're validating too frequently
    if (now - lastSessionValidation.current < SESSION_VALIDATION_INTERVAL) {
      console.log(`⏳ Session validation throttled (${now - lastSessionValidation.current}ms since last)`);
      return currentSession;
    }
    
    // Check validation rate limit
    if (sessionValidationCount.current >= MAX_VALIDATIONS_PER_MINUTE) {
      console.log(`🚫 Session validation rate limited (${sessionValidationCount.current} validations)`);
      return currentSession;
    }
    
    console.log(`🔍 Performing session validation (count: ${sessionValidationCount.current + 1})`);
    
    try {
      const validSession = await validateAndRefreshSession(currentSession);
      lastSessionValidation.current = now;
      sessionValidationCount.current++;
      
      // Reset validation counter every minute
      setTimeout(() => {
        sessionValidationCount.current = Math.max(0, sessionValidationCount.current - 1);
      }, 60000);
      
      return validSession;
    } catch (error) {
      console.error('Session validation failed:', error);
      return currentSession;
    }
  }, [validateAndRefreshSession]);

  useEffect(() => {
    console.log("Setting up AuthProvider with enhanced post-refresh stability");
    setIsLoading(true);
    setIsAuthReady(false);
    setInitializationComplete(false);

    // Enhanced initialization timeout
    const initTimeout = setTimeout(() => {
      if (!initializationComplete) {
        console.warn('⚠️ Auth initialization timeout, forcing completion');
        setIsLoading(false);
        setIsAuthReady(true);
        setInitializationComplete(true);
      }
    }, INITIALIZATION_TIMEOUT);

    // Set up auth state listener with enhanced stability
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        const now = Date.now();
        authStateChangeCount.current++;
        
        console.log(`Auth state changed, event: ${event} (change #${authStateChangeCount.current})`);
        
        // Detect rapid auth state changes with longer delay
        const timeSinceLastChange = now - lastAuthStateChange.current;
        if (timeSinceLastChange < AUTH_STABILITY_DELAY) {
          console.warn(`⚠️ Rapid auth state change detected (${timeSinceLastChange}ms), adding enhanced stability delay`);
          
          // Add enhanced delay for stability (especially post-refresh)
          await new Promise(resolve => setTimeout(resolve, AUTH_STABILITY_DELAY));
        }
        
        lastAuthStateChange.current = now;
        
        // Skip processing if initialization is not complete
        if (!initializationComplete) {
          console.log('🔄 Skipping auth state change during initialization');
          return;
        }
        
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
        
        // Signal auth is ready
        setIsAuthReady(true);
        
        // Maintain loading state for minimum time to prevent premature queries
        setTimeout(() => {
          setIsLoading(false);
          console.log('✅ Auth state change processing complete, loading disabled');
        }, 500);
      }
    );

    // Enhanced initial session check with extended loading time
    const initializeAuth = async () => {
      console.log("Initializing auth with enhanced post-refresh handling");
      
      // Minimum loading time for post-refresh scenarios
      const startTime = Date.now();
      
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        // Handle session errors gracefully
        if (error) {
          console.warn('Warning fetching session:', error);
          
          // Only sign out for critical auth errors
          if (error.message?.includes('invalid_grant') || 
              error.message?.includes('token_expired')) {
            console.log('Critical auth error detected, signing out...');
            await supabase.auth.signOut();
            setUser(null);
            setSession(null);
            setUserRoles([]);
            setIsAuthReady(true);
            setInitializationComplete(true);
            
            // Ensure minimum loading time
            const elapsed = Date.now() - startTime;
            const remainingTime = Math.max(0, POST_REFRESH_LOADING_TIME - elapsed);
            setTimeout(() => setIsLoading(false), remainingTime);
            return;
          }
          
          console.log('Non-critical auth error, continuing with current state');
        }
        
        console.log("Initial session retrieved:", !!initialSession);
        
        // Enhanced initial session validation with throttling
        const validSession = await throttledValidateSession(initialSession);
        
        // Update session and user state
        setSession(validSession);
        setUser(validSession?.user ?? null);
        
        // Fetch user roles if logged in
        if (validSession?.user) {
          console.log("User is logged in, fetching roles");
          const roles = await fetchUserRoles(validSession.user.id);
          console.log("Setting initial user roles:", roles);
          setUserRoles(roles);
        }
        
        // Signal auth is ready
        setIsAuthReady(true);
        setInitializationComplete(true);
        
      } catch (error) {
        console.warn('Warning checking session:', error);
        
        // Don't sign out immediately, continue with current state
        console.log('Session check failed, but keeping current auth state');
        setUser(null);
        setSession(null);
        setUserRoles([]);
        setIsAuthReady(true);
        setInitializationComplete(true);
      } finally {
        // Ensure minimum loading time for stability (especially post-refresh)
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, POST_REFRESH_LOADING_TIME - elapsed);
        
        setTimeout(() => {
          setIsLoading(false);
          console.log(`✅ Auth initialization complete after ${elapsed + remainingTime}ms`);
        }, remainingTime);
      }
    };

    initializeAuth();

    return () => {
      clearTimeout(initTimeout);
      subscription.unsubscribe();
    };
  }, [throttledValidateSession, fetchUserRoles]);

  const handleSignOut = async () => {
    await signOut();
    setUserRoles([]);
  };

  const value = {
    user,
    session,
    userRoles,
    isLoading,
    isAuthReady,
    initializationComplete,
    signOut: handleSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
