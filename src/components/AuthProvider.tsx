
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
  const AUTH_DEBOUNCE_DELAY = 100; // Reduced from 200ms

  // Simplified session validation - only when truly needed
  const validateSessionIfNeeded = useCallback(async (currentSession: any) => {
    if (!currentSession) return null;
    
    // Only validate if session is close to expiring (within 5 minutes)
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = currentSession.expires_at || 0;
    const shouldValidate = (expiresAt - now) < 300; // 5 minutes
    
    if (shouldValidate) {
      console.log('🔄 Session validation needed');
      return await validateAndRefreshSession(currentSession);
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
    console.log("🚀 Initializing AuthProvider (optimized)");
    setIsLoading(true);
    isAuthReady.current = false;
    sessionInitialized.current = false;

    // Set up simplified auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        const now = Date.now();
        
        // Simple debouncing to prevent rapid-fire changes
        if (now - lastAuthStateChange.current < AUTH_DEBOUNCE_DELAY) {
          return;
        }
        lastAuthStateChange.current = now;
        
        console.log(`🔄 Auth state: ${event}`);
        
        // Simplified session validation
        const validSession = await validateSessionIfNeeded(currentSession);
        
        // Update auth state immediately
        setSession(validSession);
        setUser(validSession?.user ?? null);
        
        // Fetch user roles if authenticated
        if (validSession?.user) {
          try {
            const roles = await fetchUserRoles(validSession.user.id);
            console.log("🏷️ User roles:", roles);
            setUserRoles(roles);
          } catch (error) {
            console.error("Error fetching roles:", error);
            setUserRoles([]);
          }
        } else {
          setUserRoles([]);
        }
        
        // Mark as initialized and complete loading
        if (!sessionInitialized.current) {
          sessionInitialized.current = true;
          console.log("📋 Session initialized");
          completeAuthInitialization();
        }
      }
    );

    // Initial session check
    const initializeAuth = async () => {
      console.log("🔍 Checking initial session");
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('⚠️ Session check warning:', error);
          if (error.message?.includes('invalid_grant') || 
              error.message?.includes('token_expired')) {
            await supabase.auth.signOut();
            setUser(null);
            setSession(null);
            setUserRoles([]);
          }
        }
        
        // Simple session processing
        const validSession = await validateSessionIfNeeded(initialSession);
        setSession(validSession);
        setUser(validSession?.user ?? null);
        
        if (validSession?.user) {
          const roles = await fetchUserRoles(validSession.user.id);
          setUserRoles(roles);
        }
        
        sessionInitialized.current = true;
        completeAuthInitialization();
        
      } catch (error) {
        console.warn('⚠️ Auth initialization error:', error);
        setUser(null);
        setSession(null);
        setUserRoles([]);
        sessionInitialized.current = true;
        completeAuthInitialization();
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [validateSessionIfNeeded, fetchUserRoles, completeAuthInitialization]);

  const handleSignOut = async () => {
    await signOut();
    setUserRoles([]);
    isAuthReady.current = false;
    sessionInitialized.current = false;
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
