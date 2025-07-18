
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
    console.log("🚀 Single Client AuthProvider initialized");
    setIsLoading(true);
    isAuthReady.current = false;
    sessionInitialized.current = false;

    // Single auth state listener with aggressive debouncing
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        const now = Date.now();
        
        // Aggressive debouncing - prevent cascade
        if (now - lastAuthStateChange.current < 150) {
          return;
        }
        lastAuthStateChange.current = now;
        
        console.log(`🔄 Auth: ${event}`);
        
        // Immediate state resolution
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          setUserRoles([]);
          completeAuthInitialization();
          return;
        }

        if (currentSession?.user) {
          setUser(currentSession.user);
          setSession(currentSession);
          
          // Fetch roles only once
          if (!sessionInitialized.current) {
            const roles = await fetchUserRoles(currentSession.user.id);
            setUserRoles(roles);
            sessionInitialized.current = true;
          }
        } else {
          setUser(null);
          setSession(null);
          setUserRoles([]);
        }
        
        completeAuthInitialization();
      }
    );

    // Simple initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setSession(session);
        fetchUserRoles(session.user.id).then(setUserRoles);
      }
      sessionInitialized.current = true;
      completeAuthInitialization();
    });

    return () => subscription.unsubscribe();
  }, [fetchUserRoles, completeAuthInitialization]);

  const handleSignOut = async () => {
    setUser(null);
    setSession(null);
    setUserRoles([]);
    isAuthReady.current = false;
    sessionInitialized.current = false;
    await supabase.auth.signOut();
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
