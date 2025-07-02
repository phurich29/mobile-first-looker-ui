
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  userRoles: string[];
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  userRoles: [],
  isLoading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch user roles from the database
  const fetchUserRoles = async (userId: string) => {
    try {
      console.log("Fetching roles for user:", userId);
      const { data, error } = await supabase.rpc('get_user_roles', {
        user_id: userId
      });

      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }
      
      console.log("Roles retrieved for user:", data);
      return data || [];
    } catch (error) {
      console.error('Error in fetchUserRoles:', error);
      return [];
    }
  };

  // Function to check if session is potentially stale/invalid
  const isSessionStale = (session: Session | null): boolean => {
    if (!session) return false;
    
    // Check if session is expired
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session.expires_at || 0;
    
    // Consider session stale if it expires in less than 1 minute (reduced from 5 minutes)
    const isExpiringSoon = (expiresAt - now) < 60;
    
    return isExpiringSoon;
  };

  // Enhanced session refresh with retry mechanism
  const refreshSessionWithRetry = async (currentSession: Session | null, retryCount = 0): Promise<Session | null> => {
    const maxRetries = 3;
    
    if (!currentSession || retryCount >= maxRetries) return null;
    
    try {
      console.log(`Attempting session refresh (attempt ${retryCount + 1}/${maxRetries})`);
      const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error(`Session refresh failed (attempt ${retryCount + 1}):`, error);
        
        // If it's a network error, retry after delay
        if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
          if (retryCount < maxRetries - 1) {
            const delay = 1000 * (retryCount + 1); // Progressive delay
            console.log(`Retrying session refresh in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return refreshSessionWithRetry(currentSession, retryCount + 1);
          }
        }
        
        // Only sign out for authentication errors, not network errors
        if (error.message?.includes('refresh_token_not_found') || 
            error.message?.includes('invalid_grant') ||
            error.message?.includes('token_expired')) {
          console.log('Authentication error detected, signing out...');
          await supabase.auth.signOut();
          return null;
        }
        
        // For other errors, return current session to avoid unnecessary logout
        console.warn('Non-auth error during refresh, keeping current session:', error);
        return currentSession;
      }
      
      console.log('Session refreshed successfully');
      return refreshedSession;
    } catch (error) {
      console.error('Unexpected error during session refresh:', error);
      
      // For network errors, try again if retries available
      if (retryCount < maxRetries - 1) {
        const delay = 1000 * (retryCount + 1);
        console.log(`Retrying session refresh in ${delay}ms due to unexpected error...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return refreshSessionWithRetry(currentSession, retryCount + 1);
      }
      
      // Return current session on final failure to avoid logout
      return currentSession;
    }
  };

  // Enhanced session validation using the new retry mechanism
  const validateAndRefreshSession = async (currentSession: Session | null) => {
    if (!currentSession) return null;
    
    try {
      // If session is stale, try to refresh it with retry mechanism
      if (isSessionStale(currentSession)) {
        console.log("Session is stale, attempting refresh with retry...");
        return await refreshSessionWithRetry(currentSession);
      }
      
      return currentSession;
    } catch (error) {
      console.error("Error validating session:", error);
      // Return current session instead of null to avoid unnecessary logout
      return currentSession;
    }
  };

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

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setUserRoles([]);
      
      // Clear any cached data in localStorage/sessionStorage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('auth-token'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    session,
    userRoles,
    isLoading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
