
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

  useEffect(() => {
    console.log("Setting up AuthProvider");
    setIsLoading(true);

    // Set up auth state listener first - critical to avoid race conditions
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        console.log("Auth state changed, event:", _event);
        
        // Update session and user state
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // If user is logged in, fetch roles from database
        if (currentSession?.user) {
          try {
            // Using setTimeout to avoid deadlocks with Supabase client
            setTimeout(async () => {
              const roles = await fetchUserRoles(currentSession.user.id);
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
        
        // Update session and user state immediately
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        // If user is logged in, fetch roles from database
        if (initialSession?.user) {
          console.log("User is logged in, fetching roles");
          const roles = await fetchUserRoles(initialSession.user.id);
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
