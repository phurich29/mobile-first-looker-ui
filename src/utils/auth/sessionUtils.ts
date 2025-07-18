
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// Simple session staleness check
export const isSessionStale = (session: Session | null): boolean => {
  if (!session) return false;
  
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = session.expires_at || 0;
  
  // Consider session stale if it expires in less than 5 minutes
  return (expiresAt - now) < 300;
};

// Simplified session refresh without complex retry logic
export const refreshSessionWithRetry = async (currentSession: Session | null): Promise<Session | null> => {
  if (!currentSession) return null;
  
  try {
    console.log('🔄 Refreshing session');
    const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Session refresh failed:', error);
      
      // Only sign out for critical auth errors
      if (error.message?.includes('invalid_grant') ||
          error.message?.includes('token_expired')) {
        console.log('🚨 Critical auth error, signing out');
        await supabase.auth.signOut();
        return null;
      }
      
      // For other errors, return current session
      console.warn('Non-critical refresh error, keeping current session');
      return currentSession;
    }
    
    console.log('✅ Session refreshed successfully');
    return refreshedSession;
  } catch (error) {
    console.error('Unexpected session refresh error:', error);
    return currentSession;
  }
};

// Simplified session validation
export const validateAndRefreshSession = async (currentSession: Session | null) => {
  if (!currentSession) return null;
  
  try {
    // Only refresh if session is actually stale
    if (isSessionStale(currentSession)) {
      console.log("⏰ Session is stale, refreshing");
      return await refreshSessionWithRetry(currentSession);
    }
    
    return currentSession;
  } catch (error) {
    console.error("Session validation error:", error);
    return currentSession;
  }
};
