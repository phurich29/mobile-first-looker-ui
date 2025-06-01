
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
      intervalRef.current = window.setInterval(() => {
        setSeconds(currentSeconds => {
          if (currentSeconds <= 1) {
            // When we reach zero, call onComplete and reset
            if (onCompleteRef.current) {
              const callback = onCompleteRef.current; // เก็บ reference ของ callback ปัจจุบันไว้
              setTimeout(() => {
                callback(); // เรียก callback หลังจาก React update cycle ปัจจุบันเสร็จสิ้น
              }, 0);
            }
            setLastCompleteTime(Date.now());
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
