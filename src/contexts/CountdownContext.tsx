
import { createContext, useContext, useCallback, useState, useEffect, useRef, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface CountdownContextType {
  seconds: number;
  isActive: boolean;
  start: () => void;
  pause: () => void;
  toggle: () => void;
  reset: () => void;
  lastCompleteTime: number | null;
  manualRefresh: () => void; // New manual refresh function
}

const CountdownContext = createContext<CountdownContextType | undefined>(undefined);

interface CountdownProviderProps {
  children: ReactNode;
  initialSeconds?: number;
  onComplete?: () => void;
}

export function CountdownProvider({ 
  children, 
  initialSeconds = 60, 
  onComplete 
}: CountdownProviderProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);
  const [lastCompleteTime, setLastCompleteTime] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);
  const queryClient = useQueryClient();

  // Update the ref when onComplete changes
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Manual refresh function - no automatic cascade
  const manualRefresh = useCallback(async () => {
    console.log('🔄 Manual refresh triggered');
    
    // Only invalidate essential queries
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['devices-details'] }),
      queryClient.invalidateQueries({ queryKey: ['guest-devices'] }),
    ]);
    
    console.log('✅ Manual refresh completed');
  }, [queryClient]);

  const start = useCallback(() => {
    setIsActive(true);
  }, []);

  const pause = useCallback(() => {
    setIsActive(false);
  }, []);

  const toggle = useCallback(() => {
    setIsActive(prev => !prev);
  }, []);

  const reset = useCallback(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSeconds(currentSeconds => {
          if (currentSeconds <= 1) {
            const completionTime = Date.now();
            setLastCompleteTime(completionTime);
            
            console.log('🔔 Countdown completed at:', new Date(completionTime).toISOString());
            
            // Call completion callback but DON'T trigger automatic refresh
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

  // Log countdown status less frequently to reduce console spam
  useEffect(() => {
    if (seconds % 30 === 0) { // Log every 30 seconds only
      console.log(`⏰ Countdown status: ${seconds} seconds remaining`);
    }
  }, [seconds]);

  return (
    <CountdownContext.Provider
      value={{
        seconds,
        isActive,
        start,
        pause,
        toggle,
        reset,
        lastCompleteTime,
        manualRefresh,
      }}
    >
      {children}
    </CountdownContext.Provider>
  );
}

export function useGlobalCountdown() {
  const context = useContext(CountdownContext);
  if (context === undefined) {
    throw new Error("useGlobalCountdown must be used within a CountdownProvider");
  }
  return context;
}
