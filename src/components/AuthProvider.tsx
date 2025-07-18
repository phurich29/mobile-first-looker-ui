
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
  } = useAuthSession();

  const {
    userRoles,
    setUserRoles,
    fetchUserRoles,
  } = useUserRoles();

  useEffect(() => {
    console.log("🔐 Setting up AuthProvider");
    setIsLoading(true);

    // Set up auth state listener first - critical to avoid race conditions
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("🔄 Auth state changed, event:", event);
        
        // Simple session update without additional validation
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // If user is logged in, fetch roles from database
        if (currentSession?.user) {
          try {
            const roles = await fetchUserRoles(currentSession.user.id);
            console.log("👤 Setting user roles after auth change:", roles);
            setUserRoles(roles);
          } catch (error) {
            console.error("❌ Error fetching roles during auth change:", error);
            setUserRoles([]);
          }
        } else {
          setUserRoles([]);
        }
        setIsLoading(false);
      }
    );

    // Initial session check - simplified
    const initializeAuth = async () => {
      console.log("🚀 Initializing auth");
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('⚠️ Warning fetching session:', error);
          
          // Only handle critical auth errors
          if (error.message?.includes('invalid_grant') || 
              error.message?.includes('token_expired')) {
            console.log('🚨 Critical auth error detected, signing out...');
            await supabase.auth.signOut();
            setUser(null);
            setSession(null);
            setUserRoles([]);
            setIsLoading(false);
            return;
          }
        }
        
        console.log("📋 Initial session retrieved:", !!initialSession);
        
        // Simple session update without validation
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        // If user is logged in, fetch roles from database
        if (initialSession?.user) {
          console.log("👤 User is logged in, fetching roles");
          const roles = await fetchUserRoles(initialSession.user.id);
          console.log("🏷️ Setting initial user roles:", roles);
          setUserRoles(roles);
        }
      } catch (error) {
        console.warn('⚠️ Warning checking session:', error);
        setUser(null);
        setSession(null);
        setUserRoles([]);
      } finally {
        setIsLoading(false);
        console.log("✅ Auth initialization complete");
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
