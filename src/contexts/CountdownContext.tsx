
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface CountdownContextType {
  seconds: number;
  isActive: boolean;
  start: () => void;
  pause: () => void;
  toggle: () => void;
  reset: () => void;
  lastCompleteTime: number | null;
  adaptiveInterval: number;
  retryCount: number;
  isBackgroundMode: boolean;
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
  const [adaptiveInterval, setAdaptiveInterval] = useState(initialSeconds);
  const [retryCount, setRetryCount] = useState(0);
  const [isBackgroundMode, setIsBackgroundMode] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  const lastDataChangeRef = useRef<number>(Date.now());
  const errorCountRef = useRef(0);

  // Update the ref when onComplete changes
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Monitor tab visibility for background refresh
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isBackground = document.hidden;
      setIsBackgroundMode(isBackground);
      console.log(isBackground ? "📱 Entering background mode" : "📱 Returning to foreground");
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Adaptive interval adjustment based on data change frequency
  const adjustInterval = (hasDataChange: boolean, hasError: boolean) => {
    if (hasError) {
      errorCountRef.current += 1;
      setRetryCount(errorCountRef.current);
      // Exponential backoff for errors, max 5 minutes
      const newInterval = Math.min(initialSeconds * Math.pow(2, errorCountRef.current), 300);
      setAdaptiveInterval(newInterval);
      console.log(`⚠️ Error detected, adjusting interval to ${newInterval}s (attempt ${errorCountRef.current})`);
    } else if (hasDataChange) {
      lastDataChangeRef.current = Date.now();
      errorCountRef.current = 0;
      setRetryCount(0);
      // Reset to normal interval when data changes
      setAdaptiveInterval(initialSeconds);
      console.log("📊 Data change detected, using normal interval");
    } else {
      // No data change for a while, increase interval gradually
      const timeSinceChange = Date.now() - lastDataChangeRef.current;
      if (timeSinceChange > 300000) { // 5 minutes
        const newInterval = Math.min(adaptiveInterval * 1.5, 180); // Max 3 minutes
        setAdaptiveInterval(newInterval);
        console.log(`🐌 No data changes, extending interval to ${newInterval}s`);
      }
    }
  };

  const start = () => setIsActive(true);
  const pause = () => setIsActive(false);
  const toggle = () => setIsActive(prev => !prev);
  
  const reset = () => {
    setSeconds(adaptiveInterval);
    errorCountRef.current = 0;
    setRetryCount(0);
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
      const currentInterval = isBackgroundMode ? Math.max(adaptiveInterval * 2, 120) : adaptiveInterval;
      console.log(`⏰ Countdown timer started - interval: ${currentInterval}s (background: ${isBackgroundMode}, adaptive: ${adaptiveInterval}s)`);
      
      intervalRef.current = window.setInterval(() => {
        setSeconds(currentSeconds => {
          if (currentSeconds <= 1) {
            console.log("🔔 Countdown reached zero - executing callback");
            if (onCompleteRef.current) {
              const callback = onCompleteRef.current;
              setTimeout(() => {
                console.log("🚀 Executing countdown completion callback");
                try {
                  callback();
                  adjustInterval(true, false); // Assume success means data change
                } catch (error) {
                  console.error("❌ Error in countdown callback:", error);
                  adjustInterval(false, true); // Error occurred
                }
              }, 0);
            }
            const completeTime = Date.now();
            setLastCompleteTime(completeTime);
            console.log("✅ Countdown cycle completed at:", new Date(completeTime).toISOString());
            return currentInterval;
          }
          if (currentSeconds % 30 === 0) {
            console.log(`⏰ Countdown status: ${currentSeconds}s remaining (${isBackgroundMode ? 'background' : 'foreground'})`);
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
  }, [isActive, adaptiveInterval, isBackgroundMode]);

  const value = {
    seconds,
    isActive,
    start,
    pause,
    toggle,
    reset,
    lastCompleteTime,
    adaptiveInterval,
    retryCount,
    isBackgroundMode
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
