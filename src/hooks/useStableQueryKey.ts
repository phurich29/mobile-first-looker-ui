import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const useStableQueryKey = () => {
  const queryClient = useQueryClient();

  // Batch invalidation to prevent cascade invalidations
  const batchInvalidate = useCallback(
    (keys: string[], delay = 100) => {
      const timeoutId = setTimeout(() => {
        console.log('🔄 Batch invalidating keys:', keys);
        keys.forEach(key => {
          queryClient.invalidateQueries({ queryKey: [key] });
        });
      }, delay);

      return () => clearTimeout(timeoutId);
    },
    [queryClient]
  );

  // Prevent redundant cache operations
  const smartInvalidate = useCallback(
    (key: string) => {
      const queries = queryClient.getQueryCache().findAll({ queryKey: [key] });
      
      if (queries.length === 0) {
        console.log(`⏭️ Skipping invalidation - no queries found for: ${key}`);
        return;
      }

      console.log(`♻️ Smart invalidating: ${key} (${queries.length} queries)`);
      queryClient.invalidateQueries({ queryKey: [key] });
    },
    [queryClient]
  );

  return {
    batchInvalidate,
    smartInvalidate,
  };
};