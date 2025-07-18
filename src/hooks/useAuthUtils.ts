import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

/**
 * Global logout utility - immediate and thorough cleanup
 */
export const useImmediateLogout = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const performImmediateLogout = useCallback(async () => {
    console.log('🚀 Immediate logout initiated');
    
    try {
      // 1. Cancel all ongoing operations immediately
      await Promise.all([
        queryClient.cancelQueries(),
        queryClient.clear(),
      ]);
      
      // 2. Clear all storage immediately
      localStorage.clear();
      sessionStorage.clear();
      
      // 3. Sign out (don't wait for completion)
      signOut().catch(console.error);
      
      // 4. Immediate navigation
      navigate('/auth/login', { replace: true });
      
      console.log('✅ Immediate logout completed');
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Force navigation even on error
      navigate('/auth/login', { replace: true });
    }
  }, [signOut, navigate, queryClient]);

  return { performImmediateLogout };
};

/**
 * Circuit breaker for auth operations
 */
export const useAuthCircuitBreaker = () => {
  const maxRetries = 3;
  const retryDelay = 1000;
  
  const callWithCircuitBreaker = useCallback(async (
    operation: () => Promise<any>,
    operationName: string
  ) => {
    let attempts = 0;
    
    while (attempts < maxRetries) {
      try {
        return await operation();
      } catch (error) {
        attempts++;
        console.warn(`${operationName} failed (attempt ${attempts}/${maxRetries}):`, error);
        
        if (attempts >= maxRetries) {
          console.error(`${operationName} circuit breaker opened - max retries reached`);
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempts));
      }
    }
  }, []);

  return { callWithCircuitBreaker };
};