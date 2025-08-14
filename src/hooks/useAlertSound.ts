import { useEffect, useRef } from 'react';

export const useAlertSound = (isAlertActive: boolean, enabled: boolean = true) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Function to play ding sound using Web Audio API
  const playDingSound = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;
      
      // Resume audio context if it's suspended (required by browser autoplay policies)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      // Create two ding sounds with a slight delay
      const playDing = (frequency: number, delay: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + delay);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + delay);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + delay + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + delay + 0.3);
        
        oscillator.start(audioContext.currentTime + delay);
        oscillator.stop(audioContext.currentTime + delay + 0.3);
      };

      // Play single ding sound
      playDing(800, 0);
      
    } catch (error) {
      console.warn('Could not play alert sound:', error);
    }
  };

  useEffect(() => {
    // Only play sound if both alert is active AND notifications are enabled
    if (isAlertActive && enabled) {
      // Play immediately when alert becomes active and notifications are enabled
      playDingSound();
      
      // Set up interval to play every 2 seconds
      intervalRef.current = setInterval(() => {
        playDingSound();
      }, 2000);
    } else {
      // Clear interval when alert is no longer active OR notifications are disabled
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Cleanup on unmount or when effect dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAlertActive, enabled]);

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);
};