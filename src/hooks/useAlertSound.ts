import { useEffect, useRef } from 'react';

export const useAlertSound = (isAlertActive: boolean, enabled: boolean = true) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const userInteractedRef = useRef<boolean>(false);

  // Initialize audio context on user interaction for mobile compatibility
  const initializeAudioContext = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;
      
      // Resume audio context if it's suspended (required by browser autoplay policies)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      userInteractedRef.current = true;
      return true;
    } catch (error) {
      console.warn('Could not initialize audio context:', error);
      return false;
    }
  };

  // Function to play ding sound using Web Audio API
  const playDingSound = async () => {
    try {
      // For mobile compatibility, ensure user interaction happened first
      if (!userInteractedRef.current) {
        await initializeAudioContext();
      }

      if (!audioContextRef.current) {
        console.warn('Audio context not available');
        return;
      }

      const audioContext = audioContextRef.current;
      
      // Resume audio context if it's suspended
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

  // Set up user interaction listeners for mobile compatibility
  useEffect(() => {
    const handleUserInteraction = () => {
      if (!userInteractedRef.current) {
        initializeAudioContext();
      }
    };

    // Add listeners for various user interaction events
    const events = ['click', 'touchstart', 'touchend', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true, passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, []);

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