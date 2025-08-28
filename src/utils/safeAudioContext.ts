/**
 * Safe AudioContext wrapper for iOS PWA compatibility
 * Prevents "operation is insecure" errors by properly handling AudioContext creation
 */

let globalAudioContext: AudioContext | null = null;
let isInitialized = false;
let userHasInteracted = false;

// Track user interactions
const trackUserInteraction = () => {
  if (!userHasInteracted) {
    userHasInteracted = true;
    console.log('🎵 User interaction detected - AudioContext can now be safely created');
  }
};

// Add interaction listeners once
const addInteractionListeners = () => {
  const events = ['click', 'touchstart', 'touchend', 'keydown', 'mousedown'];
  events.forEach(event => {
    document.addEventListener(event, trackUserInteraction, { once: true, passive: true });
  });
};

// Initialize listeners when module loads
if (typeof document !== 'undefined') {
  addInteractionListeners();
}

/**
 * Safely creates and returns a global AudioContext
 * Returns null if creation would be unsafe (no user interaction)
 * TEMPORARILY DISABLED FOR iOS PWA COMPATIBILITY
 */
export const getSafeAudioContext = async (): Promise<AudioContext | null> => {
  console.log('🔇 AudioContext temporarily disabled for iOS PWA compatibility');
  return null;
};

/**
 * Checks if AudioContext can be safely created
 * TEMPORARILY DISABLED FOR iOS PWA COMPATIBILITY
 */
export const canCreateAudioContext = (): boolean => {
  return false; // Temporarily disabled
};

/**
 * Safely closes the global AudioContext
 */
export const closeSafeAudioContext = async (): Promise<void> => {
  if (globalAudioContext && globalAudioContext.state !== 'closed') {
    try {
      await globalAudioContext.close();
      console.log('🔇 AudioContext closed safely');
    } catch (error) {
      console.warn('Error closing AudioContext:', error);
    }
  }
  globalAudioContext = null;
  isInitialized = false;
};

/**
 * Force user interaction check (useful for testing)
 */
export const forceUserInteraction = (): void => {
  userHasInteracted = true;
};

/**
 * Get current AudioContext state
 */
export const getAudioContextState = (): string => {
  return globalAudioContext?.state || 'none';
};