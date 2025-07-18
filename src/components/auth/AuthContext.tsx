
import { createContext, useContext } from "react";
import { User, Session } from "@supabase/supabase-js";

export type AuthContextType = {
  user: User | null;
  session: Session | null;
  userRoles: string[];
  isLoading: boolean;
  signOut: () => Promise<void>;
  isAuthReady?: boolean; // Add auth readiness flag
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  userRoles: [],
  isLoading: true,
  signOut: async () => {},
  isAuthReady: false,
});

export const useAuth = () => useContext(AuthContext);
