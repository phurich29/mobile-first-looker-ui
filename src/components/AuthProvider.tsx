
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
    clearRolesCache,
  } = useUserRoles();

  useEffect(() => {
    console.log("🔐 Setting up AuthProvider");
    setIsLoading(true);

    // Set up auth state listener first - critical to avoid race conditions
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("🔄 Auth state changed, event:", event);
        
        // Simple session update without additional validation
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Handle user roles based on auth event
        if (currentSession?.user) {
          // For SIGNED_IN event, fetch roles (cached or fresh)
          if (event === 'SIGNED_IN') {
            setTimeout(async () => {
              try {
                const roles = await fetchUserRoles(currentSession.user.id);
                console.log("👤 Setting user roles after sign in:", roles);
                setUserRoles(roles);
              } catch (error) {
                console.error("❌ Error fetching roles during sign in:", error);
                setUserRoles([]);
              }
            }, 0);
          }
          // For other events (TOKEN_REFRESHED), keep existing roles to avoid redundant calls
        } else {
          // User signed out, clear everything
          if (event === 'SIGNED_OUT') {
            clearRolesCache();
          }
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
        
        // If user is logged in, fetch roles from cache or database
        if (initialSession?.user) {
          console.log("👤 User is logged in, checking roles");
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
    clearRolesCache();
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
