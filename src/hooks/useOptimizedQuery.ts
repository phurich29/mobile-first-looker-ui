import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCallback, useState } from "react";

/**
 * Circuit breaker pattern for React Query
 * ป้องกัน infinite loops และ cascade failures
 */
export const useQueryCircuitBreaker = () => {
  const [failureCount, setFailureCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [lastFailure, setLastFailure] = useState<number>(0);
  
  const maxFailures = 3;
  const resetTimeoutMs = 30000; // 30 seconds

  const shouldAllowQuery = useCallback(() => {
    const now = Date.now();
    
    // Reset circuit breaker after timeout
    if (isOpen && (now - lastFailure) > resetTimeoutMs) {
      console.log('🔄 Circuit breaker reset - allowing queries');
      setIsOpen(false);
      setFailureCount(0);
      return true;
    }
    
    return !isOpen;
  }, [isOpen, lastFailure, resetTimeoutMs]);

  const recordSuccess = useCallback(() => {
    if (failureCount > 0) {
      console.log('✅ Circuit breaker success - resetting failure count');
      setFailureCount(0);
      setIsOpen(false);
    }
  }, [failureCount]);

  const recordFailure = useCallback(() => {
    const newFailureCount = failureCount + 1;
    setFailureCount(newFailureCount);
    setLastFailure(Date.now());
    
    if (newFailureCount >= maxFailures && !isOpen) {
      console.warn(`🔴 Circuit breaker opened after ${newFailureCount} failures`);
      setIsOpen(true);
    }
  }, [failureCount, isOpen, maxFailures]);

  return {
    shouldAllowQuery,
    recordSuccess,
    recordFailure,
    isOpen,
    failureCount,
  };
};

/**
 * Optimized query hook with performance monitoring
 */
export const useOptimizedQuery = <T>(
  queryKey: any[],
  queryFn: () => Promise<T>,
  options: any = {}
) => {
  const { shouldAllowQuery, recordSuccess, recordFailure } = useQueryCircuitBreaker();
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      // Check circuit breaker
      if (!shouldAllowQuery()) {
        throw new Error('Circuit breaker is open - queries blocked');
      }
      
      const startTime = performance.now();
      
      try {
        const result = await queryFn();
        const executionTime = performance.now() - startTime;
        
        // Log performance
        if (executionTime > 200) {
          console.warn(`⚠️ Slow query: ${queryKey.join('/')} took ${executionTime.toFixed(2)}ms`);
        } else {
          console.log(`⚡ Fast query: ${queryKey.join('/')} took ${executionTime.toFixed(2)}ms`);
        }
        
        recordSuccess();
        return result;
        
      } catch (error) {
        const executionTime = performance.now() - startTime;
        console.error(`❌ Query failed: ${queryKey.join('/')} after ${executionTime.toFixed(2)}ms`, error);
        recordFailure();
        throw error;
      }
    },
    ...options,
    // Override retry behavior to work with circuit breaker
    retry: (failureCount: number, error: any) => {
      if (error.message?.includes('Circuit breaker is open')) {
        return false; // Don't retry when circuit is open
      }
      return options.retry !== undefined ? options.retry : (failureCount < 1);
    },
  });
};

/**
 * Performance monitoring utilities
 */
export const usePerformanceMonitor = () => {
  const queryClient = useQueryClient();
  
  const getQueryStats = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    const stats = {
      totalQueries: queries.length,
      activeQueries: queries.filter(q => q.state.fetchStatus === 'fetching').length,
      errorQueries: queries.filter(q => q.state.status === 'error').length,
      staleQueries: queries.filter(q => q.isStale()).length,
      cacheSize: queries.reduce((acc, q) => acc + JSON.stringify(q.state.data || {}).length, 0),
    };
    
    return stats;
  }, [queryClient]);

  const clearSlowQueries = useCallback(() => {
    console.log('🧹 Clearing potentially slow queries...');
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        const age = Date.now() - (query.state.dataUpdatedAt || 0);
        return age > 300000; // Clear queries older than 5 minutes
      }
    });
  }, [queryClient]);

  return {
    getQueryStats,
    clearSlowQueries,
  };
};