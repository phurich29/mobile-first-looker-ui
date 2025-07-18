
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface CountdownContextType {
  seconds: number;
  isActive: boolean;
  start: () => void;
  pause: () => void;
  toggle: () => void;
  reset: () => void;
  lastCompleteTime: number | null;
}

const CountdownContext = createContext<CountdownContextType | undefined>(undefined);

interface CountdownProviderProps {
  initialSeconds?: number;
  onComplete?: () => void;
  children: React.ReactNode;
}

export const CountdownProvider: React.FC<CountdownProviderProps> = ({
  initialSeconds = 60,
  onComplete,
  children
}) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);
  const [lastCompleteTime, setLastCompleteTime] = useState<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  const isMountedRef = useRef(true);

  // Update the ref when onComplete changes
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const start = () => setIsActive(true);
  const pause = () => setIsActive(false);
  const toggle = () => setIsActive(prev => !prev);
  
  const reset = () => {
    setSeconds(initialSeconds);
    if (onCompleteRef.current) {
      const callback = onCompleteRef.current;
      setTimeout(() => {
        callback();
      }, 0);
    }
    setLastCompleteTime(Date.now());
  };

  useEffect(() => {
    if (isActive) {
      console.log("⏰ Countdown timer started - interval:", initialSeconds, "seconds");
      intervalRef.current = window.setInterval(() => {
        setSeconds(currentSeconds => {
          if (!isMountedRef.current) return currentSeconds;
          
          if (currentSeconds <= 1) {
            console.log("🔔 Countdown reached zero - executing callback");
            if (onCompleteRef.current && isMountedRef.current) {
              const callback = onCompleteRef.current;
              setTimeout(() => {
                if (isMountedRef.current) {
                  console.log("🚀 Executing countdown completion callback");
                  callback();
                }
              }, 0);
            }
            const completeTime = Date.now();
            if (isMountedRef.current) {
              setLastCompleteTime(completeTime);
              console.log("✅ Countdown cycle completed at:", new Date(completeTime).toISOString());
            }
            return initialSeconds;
          }
          if (currentSeconds % 30 === 0) {
            console.log("⏰ Countdown status:", currentSeconds, "seconds remaining");
          }
          return currentSeconds - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      console.log("⏸️ Countdown timer paused");
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        console.log("🛑 Countdown timer cleanup");
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, initialSeconds]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("🛑 CountdownProvider unmounting - cleaning up");
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const value = {
    seconds,
    isActive,
    start,
    pause,
    toggle,
    reset,
    lastCompleteTime
  };

  return (
    <CountdownContext.Provider value={value}>
      {children}
    </CountdownContext.Provider>
  );
};

export const useGlobalCountdown = () => {
  const context = useContext(CountdownContext);
  if (context === undefined) {
    throw new Error('useGlobalCountdown must be used within a CountdownProvider');
  }
  return context;
};
