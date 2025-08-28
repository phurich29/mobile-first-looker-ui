import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { emergencyStopAllAlerts } from '@/hooks/useNotificationControl';

/**
 * Hook to handle cleanup when navigating between pages
 * Prevents audio from continuing to play after page changes
 */
export const usePageNavigation = () => {
  const location = useLocation();

  useEffect(() => {
    // Emergency stop all alerts when page changes
    emergencyStopAllAlerts();
    
    // Additional cleanup - stop any lingering audio contexts
    const cleanup = () => {
      // Force garbage collection of audio contexts if possible
      if ((window as any).__globalAudioContext) {
        try {
          const audioContext = (window as any).__globalAudioContext;
          // Suspend instead of close to allow reuse but stop current sounds
          if (audioContext.state === 'running') {
            audioContext.suspend();
          }
        } catch (error) {
          console.warn('Could not suspend audio context:', error);
        }
      }
      
      // Clear all global audio locks
      if ((window as any).__alertSoundLock) {
        const lock = (window as any).__alertSoundLock;
        lock.running = false;
        lock.ownerId = null;
        if (lock.cancelRef) {
          lock.cancelRef.canceled = true;
        }
      }
      
      // Stop all HTML audio elements
      document.querySelectorAll('audio').forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
        audio.src = '';
      });
    };

    // Run cleanup immediately
    cleanup();
    
    // Also run cleanup after a short delay to catch any delayed audio
    const timeoutId = setTimeout(cleanup, 100);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [location.pathname]); // Run whenever the path changes
};