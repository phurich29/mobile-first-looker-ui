import { useEffect } from 'react';
import { emergencyStopAllAlerts } from '@/hooks/useNotificationControl';

/**
 * Hook to handle cleanup and immediate notification check when navigating between pages
 */
export const usePageNavigation = (onPageChange?: () => void) => {
  useEffect(() => {
    let previousPath = window.location.pathname;
    
    const handlePathChange = () => {
      const currentPath = window.location.pathname;
      if (currentPath !== previousPath) {
        console.log('🚨 Page changed from', previousPath, 'to', currentPath);
        
        // First: Emergency stop all current alerts
        emergencyStopAllAlerts();
        
        // Clean up audio immediately
        const cleanup = () => {
          if ((window as any).__globalAudioContext) {
            try {
              const audioContext = (window as any).__globalAudioContext;
              if (audioContext.state === 'running') {
                audioContext.suspend();
              }
            } catch (error) {
              console.warn('Could not suspend audio context:', error);
            }
          }
          
          if ((window as any).__alertSoundLock) {
            const lock = (window as any).__alertSoundLock;
            lock.running = false;
            lock.ownerId = null;
            if (lock.cancelRef) {
              lock.cancelRef.canceled = true;
            }
          }
          
          document.querySelectorAll('audio').forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
            audio.src = '';
          });
        };

        cleanup();
        
        // Second: Trigger immediate notification check after cleanup
        if (onPageChange) {
          setTimeout(() => {
            console.log('🔔 Triggering immediate notification check after page change');
            onPageChange();
          }, 200); // Small delay to ensure cleanup is complete
        }
        
        previousPath = currentPath;
      }
    };

    const checkInterval = setInterval(handlePathChange, 500);
    window.addEventListener('popstate', handlePathChange);
    
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
  }, [onPageChange]);
};