
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

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // If user is logged in, use metadata to determine roles
        if (currentSession?.user) {
          // For simplicity, we'll use email domain to determine roles
          // Real implementation would use a proper roles table
          const email = currentSession.user.email || '';
          let roles = ['user']; // Default role for all authenticated users
          
          // For demo purposes: assign admin role based on email
          if (email.includes('admin') || email.includes('superadmin')) {
            roles.push('admin');
            // Additional superadmin check
            if (email.includes('superadmin')) {
              roles.push('superadmin');
            }
          }
          
          setUserRoles(roles);
        } else {
          setUserRoles([]);
        }
      }
    );

    // Initial session check
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        // If user is logged in, determine roles
        if (initialSession?.user) {
          const email = initialSession.user.email || '';
          let roles = ['user']; // Default role
          
          // For demo purposes: assign admin role based on email
          if (email.includes('admin') || email.includes('superadmin')) {
            roles.push('admin');
            // Additional superadmin check
            if (email.includes('superadmin')) {
              roles.push('superadmin');
            }
          }
          
          setUserRoles(roles);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
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
