import { useRef, useCallback } from 'react';

// Request deduplication for preventing simultaneous API calls
const pendingRequests = new Map<string, Promise<any>>();

export const useDeviceRequestDeduplication = () => {
  const requestCounter = useRef(0);

  const deduplicateRequest = useCallback(
    <T>(key: string, requestFn: () => Promise<T>): Promise<T> => {
      // If request is already pending, return the existing promise
      if (pendingRequests.has(key)) {
        console.log(`🔄 Deduplicating request: ${key}`);
        return pendingRequests.get(key)!;
      }

      // Create new request
      const request = requestFn()
        .finally(() => {
          // Clean up after request completes
          pendingRequests.delete(key);
        });

      pendingRequests.set(key, request);
      requestCounter.current++;
      
      console.log(`🆕 New request: ${key} (Total pending: ${pendingRequests.size})`);
      return request;
    },
    []
  );

  const clearPendingRequests = useCallback(() => {
    pendingRequests.clear();
    console.log('🧹 Cleared all pending requests');
  }, []);

  const getPendingCount = useCallback(() => pendingRequests.size, []);

  return {
    deduplicateRequest,
    clearPendingRequests,
    getPendingCount,
    totalRequests: requestCounter.current,
  };
};