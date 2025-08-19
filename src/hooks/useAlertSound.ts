import { useEffect, useRef } from 'react';
import { generateNotificationSound, getCurrentNotificationSound, type NotificationSoundType } from '@/components/profile/NotificationSoundSettings';

interface UseAlertSoundOptions {
  enabled?: boolean;
  playOnce?: boolean; // เล่นแค่ครั้งเดียวหรือวนลูป
  intervalMs?: number; // ช่วงเวลาระหว่างการเล่น (ถ้าไม่ใช่ playOnce)
}

export const useAlertSound = (
  isAlertActive: boolean, 
  options: UseAlertSoundOptions = {}
) => {
  const { enabled = true, playOnce = true, intervalMs = 5000 } = options;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const userInteractedRef = useRef<boolean>(false);
  const hasPlayedRef = useRef<boolean>(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioNodesRef = useRef<Array<{ oscillator: OscillatorNode; gainNode: GainNode }>>([]);

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

  // Function to stop all currently playing sounds
  const stopAllSounds = () => {
    // Stop MP3 audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    
    // Stop Web Audio API nodes
    audioNodesRef.current.forEach(({ oscillator, gainNode }) => {
      try {
        gainNode.gain.setValueAtTime(0, audioContextRef.current?.currentTime || 0);
        oscillator.stop();
      } catch (error) {
        // Oscillator might already be stopped
      }
    });
    audioNodesRef.current = [];
  };

  // Function to play notification sound using the selected sound preference
  const playNotificationSound = async () => {
    try {
      // For mobile compatibility, ensure user interaction happened first
      if (!userInteractedRef.current) {
        await initializeAudioContext();
      }

      // Get the user's selected notification sound
      const selectedSound = getCurrentNotificationSound();
      
      // Use the new sound generation system with references for stopping
      await generateNotificationSound(selectedSound, currentAudioRef, audioNodesRef);
      
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
      // Reset the played flag when alert becomes active
      hasPlayedRef.current = false;
      
      // Play immediately when alert becomes active and notifications are enabled
      playNotificationSound();
      hasPlayedRef.current = true;
      
      if (playOnce) {
        // Single play mode: just play once and stop
        // No need to set up any timer
      } else {
        // Continuous play mode: set up interval to repeat
        timerRef.current = setInterval(() => {
          playNotificationSound();
        }, intervalMs);
      }
    } else {
      // Clear timer when alert is no longer active OR notifications are disabled
      if (timerRef.current) {
        if (playOnce) {
          clearTimeout(timerRef.current);
        } else {
          clearInterval(timerRef.current);
        }
        timerRef.current = null;
      }
      
      // IMPORTANT: Stop all currently playing sounds immediately
      stopAllSounds();
      
      // Reset played flag when alert becomes inactive
      hasPlayedRef.current = false;
    }

    // Cleanup on unmount or when effect dependencies change
    return () => {
      if (timerRef.current) {
        if (playOnce) {
          clearTimeout(timerRef.current);
        } else {
          clearInterval(timerRef.current);
        }
        timerRef.current = null;
      }
      // Also stop any playing sounds on cleanup
      stopAllSounds();
    };
  }, [isAlertActive, enabled, playOnce, intervalMs]);

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      // Stop all sounds before closing context
      stopAllSounds();
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);
};