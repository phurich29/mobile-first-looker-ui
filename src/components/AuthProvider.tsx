
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

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        console.log("Auth state changed, event:", _event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Fetch roles outside the callback to prevent deadlocks
        if (currentSession?.user) {
          setTimeout(async () => {
            const roles = await fetchUserRoles(currentSession.user.id);
            setUserRoles(roles);
            setIsLoading(false);
          }, 0);
        } else {
          setUserRoles([]);
          setIsLoading(false);
        }
      }
    );

    // Initial session check
    const initializeAuth = async () => {
      console.log("Initializing auth");
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log("Initial session retrieved:", !!initialSession);
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        // If user is logged in, fetch roles from database
        if (initialSession?.user) {
          console.log("User is logged in, fetching roles");
          const roles = await fetchUserRoles(initialSession.user.id);
          setUserRoles(roles);
        }
      } catch (error) {
        console.error('Error checking session:', error);
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
