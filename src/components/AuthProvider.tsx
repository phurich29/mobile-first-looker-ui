
import { useEffect, ReactNode } from "react";
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

  useEffect(() => {
    console.log("Setting up AuthProvider");
    setIsLoading(true);

    // Set up auth state listener first - critical to avoid race conditions
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed, event:", event);
        
        // Validate session before using it
        const validSession = await validateAndRefreshSession(currentSession);
        
        // Update session and user state
        setSession(validSession);
        setUser(validSession?.user ?? null);
        
        // If user is logged in, fetch roles from database
        if (validSession?.user) {
          try {
            // Using setTimeout to avoid deadlocks with Supabase client
            setTimeout(async () => {
              const roles = await fetchUserRoles(validSession.user.id);
              console.log("Setting user roles after auth change:", roles);
              setUserRoles(roles);
              setIsLoading(false);
            }, 0);
          } catch (error) {
            console.error("Error fetching roles during auth change:", error);
            setUserRoles([]);
            setIsLoading(false);
          }
        } else {
          setUserRoles([]);
          setIsLoading(false);
        }
      }
    );

    // Initial session check happens after setting up the listener
    const initializeAuth = async () => {
      console.log("Initializing auth");
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        // ตรวจสอบข้อผิดพลาด refresh_token_not_found
        if (error) {
          console.error('Error fetching session:', error);
          
          // ตรวจสอบว่าเป็นข้อผิดพลาด refresh_token_not_found หรือไม่
          if (error.message?.includes('refresh_token_not_found') ||
              (error as any)?.code === 'refresh_token_not_found' ||
              (error as any)?.__isAuthError) {
            console.log('Session expired or refresh token not found, signing out...');
            await supabase.auth.signOut();
            setUser(null);
            setSession(null);
            setUserRoles([]);
            setIsLoading(false);
            return;
          }
        }
        
        console.log("Initial session retrieved:", !!initialSession);
        
        // Validate initial session
        const validSession = await validateAndRefreshSession(initialSession);
        
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
        console.error('Error checking session:', error);
        
        // กรณีเกิดข้อผิดพลาดใดๆ ให้ทำการ sign out เพื่อความปลอดภัย
        try {
          console.log('Signing out due to auth error...');
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          setUserRoles([]);
        } catch (signOutError) {
          console.error('Error signing out:', signOutError);
        }
      } finally {
        setIsLoading(false);
        console.log("Auth initialization complete");
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
