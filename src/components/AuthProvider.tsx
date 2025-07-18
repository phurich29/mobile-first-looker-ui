
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

  // Simplified auth readiness tracking
  const isAuthReady = useRef<boolean>(false);
  const sessionInitialized = useRef<boolean>(false);
  const lastAuthStateChange = useRef<number>(0);
  
  // Reduced debouncing delay for faster response
  const AUTH_DEBOUNCE_DELAY = 50; // Further reduced to 50ms

  // Circuit breaker for session validation to prevent loops
  const validationInProgress = useRef<boolean>(false);
  
  const validateSessionIfNeeded = useCallback(async (currentSession: any) => {
    if (!currentSession || validationInProgress.current) return currentSession;
    
    // Only validate if session is close to expiring (within 5 minutes)
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = currentSession.expires_at || 0;
    const shouldValidate = (expiresAt - now) < 300; // 5 minutes
    
    if (shouldValidate) {
      validationInProgress.current = true;
      console.log('🔄 Session validation needed');
      try {
        const result = await validateAndRefreshSession(currentSession);
        return result;
      } finally {
        validationInProgress.current = false;
      }
    }
    
    return currentSession;
  }, [validateAndRefreshSession]);

  // Natural loading completion without artificial delays
  const completeAuthInitialization = useCallback(() => {
    if (sessionInitialized.current && !isAuthReady.current) {
      console.log('✅ Auth initialization complete');
      isAuthReady.current = true;
      setIsLoading(false);
    }
  }, [setIsLoading]);

  useEffect(() => {
    console.log("🚀 Simplified AuthProvider initialized");
    
    // Single, simple auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`🔄 Auth: ${event}`);
        
        // Immediate state updates - no debouncing needed
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          setSession(null);
          setUserRoles([]);
          setIsLoading(false);
          isAuthReady.current = true;
          return;
        }

        if (session?.user) {
          setUser(session.user);
          setSession(session);
          
          // Fetch roles only once per session
          if (!sessionInitialized.current) {
            try {
              const roles = await fetchUserRoles(session.user.id);
              setUserRoles(roles);
            } catch (error) {
              console.warn('Role fetch failed:', error);
              setUserRoles([]);
            }
            sessionInitialized.current = true;
          }
        }
        
        setIsLoading(false);
        isAuthReady.current = true;
      }
    );

    // Simple initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setSession(session);
        fetchUserRoles(session.user.id)
          .then(setUserRoles)
          .catch(() => setUserRoles([]));
      }
      sessionInitialized.current = true;
      setIsLoading(false);
      isAuthReady.current = true;
    });

    return () => subscription.unsubscribe();
  }, [fetchUserRoles]);

  // Immediate logout function
  const handleSignOut = async () => {
    console.log('🚀 Immediate logout initiated');
    
    // Set states immediately
    setUser(null);
    setSession(null);
    setUserRoles([]);
    setIsLoading(false);
    isAuthReady.current = false;
    sessionInitialized.current = false;
    
    // Sign out from Supabase (async, but don't wait)
    supabase.auth.signOut().catch(console.error);
    
    console.log('✅ Immediate logout completed');
  };

  const value = {
    user,
    session,
    userRoles,
    isLoading,
    signOut: handleSignOut,
    isAuthReady: isAuthReady.current,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
