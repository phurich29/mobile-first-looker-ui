import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// Function to check if session is potentially stale/invalid
export const isSessionStale = (session: Session | null): boolean => {
  if (!session) return false;
  
  // Check if session is expired
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = session.expires_at || 0;
  
  // Consider session stale if it expires in less than 1 minute (reduced from 5 minutes)
  const isExpiringSoon = (expiresAt - now) < 60;
  
  return isExpiringSoon;
};

// Enhanced session refresh with retry mechanism
export const refreshSessionWithRetry = async (currentSession: Session | null, retryCount = 0): Promise<Session | null> => {
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
export const validateAndRefreshSession = async (currentSession: Session | null) => {
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