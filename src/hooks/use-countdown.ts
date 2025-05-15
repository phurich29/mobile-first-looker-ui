
import { useState, useEffect, useRef, useCallback } from "react";

interface UseCountdownProps {
  initialSeconds?: number;
  onComplete?: () => void;
  autoStart?: boolean;
}

export function useCountdown({
  initialSeconds = 60,
  onComplete,
  autoStart = true,
}: UseCountdownProps = {}) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(autoStart);
  const intervalRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);

  // Update the ref when onComplete changes
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const reset = useCallback(() => {
    setSeconds(initialSeconds);
    if (isActive) {
      // Optionally trigger onComplete when manually reset
      onCompleteRef.current?.();
    }
  }, [initialSeconds, isActive]);

  const start = useCallback(() => {
    setIsActive(true);
  }, []);

  const pause = useCallback(() => {
    setIsActive(false);
  }, []);

  const toggle = useCallback(() => {
    setIsActive(prev => !prev);
  }, []);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = window.setInterval(() => {
        setSeconds(currentSeconds => {
          if (currentSeconds <= 1) {
            // When we reach zero, call onComplete and reset
            if (onCompleteRef.current) {
              onCompleteRef.current();
            }
            return initialSeconds;
          }
          return currentSeconds - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, initialSeconds]);

  return {
    seconds,
    isActive,
    start,
    pause,
    toggle,
    reset,
  };
}
