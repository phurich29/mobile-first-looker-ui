import { useRef, useEffect } from 'react';

/**
 * Hook to track if component is still mounted
 * Prevents state updates on unmounted components
 */
export function useMountedRef() {
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return isMountedRef;
}