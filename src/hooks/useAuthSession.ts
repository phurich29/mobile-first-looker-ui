import { useState, useEffect, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { validateAndRefreshSession } from "@/utils/auth/sessionUtils";

export const useAuthSession = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const signOut = useCallback(async () => {
    try {
      // Immediately clear state
      setUser(null);
      setSession(null);
      setIsLoading(false);
      
      // Clear all cached data immediately
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('auth-token') || key.includes('user_roles'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Force sign out from Supabase
      await supabase.auth.signOut({ scope: 'global' });
      
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if signOut fails, ensure local state is cleared
      setUser(null);
      setSession(null);
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    setUser,
    session,
    setSession,
    isLoading,
    setIsLoading,
    signOut,
    validateAndRefreshSession,
  };
};