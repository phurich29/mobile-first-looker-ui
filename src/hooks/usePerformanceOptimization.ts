import { useRef, useCallback, useEffect } from 'react';

// Debounce hook to prevent excessive re-renders
export const useDebounce = <T extends any[]>(
  callback: (...args: T) => void,
  delay: number
) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback(
    (...args: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

// Throttle hook to limit function calls
export const useThrottle = <T extends any[]>(
  callback: (...args: T) => void,
  limit: number
) => {
  const inThrottle = useRef(false);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const throttledCallback = useCallback(
    (...args: T) => {
      if (!inThrottle.current) {
        callbackRef.current(...args);
        inThrottle.current = true;
        setTimeout(() => {
          inThrottle.current = false;
        }, limit);
      }
    },
    [limit]
  );

  return throttledCallback;
};