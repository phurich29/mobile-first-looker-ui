import { createContext, useContext } from "react";
import { User, Session } from "@supabase/supabase-js";

export type AuthContextType = {
  user: User | null;
  session: Session | null;
  userRoles: string[];
  isLoading: boolean;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  userRoles: [],
  isLoading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);