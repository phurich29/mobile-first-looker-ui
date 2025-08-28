import { useEffect } from 'react';
import { emergencyStopAllAlerts } from '@/hooks/useNotificationControl';

/**
 * Hook to handle cleanup when navigating between pages
 * Prevents audio from continuing to play after page changes
 */
export const usePageNavigation = () => {
  useEffect(() => {
    let previousPath = window.location.pathname;
    
    const handlePathChange = () => {
      const currentPath = window.location.pathname;
      if (currentPath !== previousPath) {
        console.log('🚨 Page changed from', previousPath, 'to', currentPath, '- stopping all alerts');
        
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
        setTimeout(cleanup, 100);
        
        previousPath = currentPath;
      }
    };

    // Check for path changes using multiple methods
    const checkInterval = setInterval(handlePathChange, 500);
    
    // Listen for popstate events (back/forward browser navigation)
    window.addEventListener('popstate', handlePathChange);
    
    // Listen for pushstate/replacestate (programmatic navigation)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      setTimeout(handlePathChange, 0);
    };
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      setTimeout(handlePathChange, 0);
    };
    
    return () => {
      clearInterval(checkInterval);
      window.removeEventListener('popstate', handlePathChange);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []); // Empty dependency array - run once on mount
};