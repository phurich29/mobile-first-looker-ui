
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

  // Session stability tracking
  const lastSessionValidation = useRef<number>(0);
  const sessionValidationCount = useRef<number>(0);
  const authStateChangeCount = useRef<number>(0);
  const lastAuthStateChange = useRef<number>(Date.now());
  
  // Session validation throttling
  const SESSION_VALIDATION_INTERVAL = 30000; // 30 seconds minimum between validations
  const MAX_VALIDATIONS_PER_MINUTE = 3;
  const AUTH_STABILITY_DELAY = 1000; // 1 second delay for auth state changes

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
    console.log("Setting up AuthProvider with enhanced stability checks");
    setIsLoading(true);

    // Set up auth state listener with stability enhancement
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        const now = Date.now();
        authStateChangeCount.current++;
        
        console.log(`Auth state changed, event: ${event} (change #${authStateChangeCount.current})`);
        
        // Detect rapid auth state changes
        const timeSinceLastChange = now - lastAuthStateChange.current;
        if (timeSinceLastChange < AUTH_STABILITY_DELAY) {
          console.warn(`⚠️ Rapid auth state change detected (${timeSinceLastChange}ms), adding stability delay`);
          
          // Add delay for stability
          await new Promise(resolve => setTimeout(resolve, AUTH_STABILITY_DELAY));
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
        setIsLoading(false);
      }
    );

    // Initial session check happens after setting up the listener
    const initializeAuth = async () => {
      console.log("Initializing auth");
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        // ตรวจสอบข้อผิดพลาด refresh_token_not_found แต่ไม่ sign out ทันที
        if (error) {
          console.warn('Warning fetching session:', error);
          
          // เฉพาะ auth error ที่ร้ายแรงเท่านั้นที่จะ sign out
          if (error.message?.includes('invalid_grant') || 
              error.message?.includes('token_expired')) {
            console.log('Critical auth error detected, signing out...');
            await supabase.auth.signOut();
            setUser(null);
            setSession(null);
            setUserRoles([]);
            setIsLoading(false);
            return;
          }
          
          // สำหรับ error อื่นๆ ให้ log แต่ไม่ sign out
          console.log('Non-critical auth error, continuing with current state');
        }
        
        console.log("Initial session retrieved:", !!initialSession);
        
        // Enhanced initial session validation with throttling
        const validSession = await throttledValidateSession(initialSession);
        
        // Update session and user state immediately
        setSession(validSession);
        setUser(validSession?.user ?? null);
        
        // If user is logged in, fetch roles from database
        if (validSession?.user) {
          console.log("User is logged in, fetching roles");
          const roles = await fetchUserRoles(validSession.user.id);
          console.log("Setting initial user roles:", roles);
          setUserRoles(roles);
        }
      } catch (error) {
        console.warn('Warning checking session:', error);
        
        // ไม่ sign out ทันที แต่ให้ continue ด้วย current state
        console.log('Session check failed, but keeping current auth state');
        setUser(null);
        setSession(null);
        setUserRoles([]);
      } finally {
        setIsLoading(false);
        console.log("Auth initialization complete");
      }
    };

    initializeAuth();

    return () => {
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
    signOut: handleSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
