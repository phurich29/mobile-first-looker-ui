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
 */
export const getSafeAudioContext = async (): Promise<AudioContext | null> => {
  try {
    // Check if AudioContext is supported
    if (typeof window === 'undefined' || (!window.AudioContext && !(window as any).webkitAudioContext)) {
      console.warn('AudioContext not supported');
      return null;
    }

    // Only create AudioContext after user interaction to prevent iOS security errors
    if (!userHasInteracted) {
      console.log('⚠️ AudioContext creation skipped - waiting for user interaction');
      return null;
    }

    // Return existing context if available
    if (globalAudioContext && globalAudioContext.state !== 'closed') {
      // Resume if suspended
      if (globalAudioContext.state === 'suspended') {
        await globalAudioContext.resume();
      }
      return globalAudioContext;
    }

    // Create new AudioContext safely
    console.log('🎵 Creating safe AudioContext...');
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    globalAudioContext = new AudioContextClass();
    
    // Resume if needed
    if (globalAudioContext.state === 'suspended') {
      await globalAudioContext.resume();
    }

    isInitialized = true;
    console.log('✅ AudioContext created successfully:', globalAudioContext.state);
    
    return globalAudioContext;
    
  } catch (error) {
    console.warn('Failed to create safe AudioContext:', error);
    globalAudioContext = null;
    return null;
  }
};

/**
 * Checks if AudioContext can be safely created
 */
export const canCreateAudioContext = (): boolean => {
  return userHasInteracted && (typeof window !== 'undefined') && 
         (window.AudioContext || (window as any).webkitAudioContext);
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