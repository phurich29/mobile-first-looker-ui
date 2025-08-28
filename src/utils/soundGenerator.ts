// Sound generator utility for creating different notification sounds
// ENHANCED FOR MOBILE BROWSER COMPATIBILITY with LOUDER VOLUME
import { NotificationSoundType } from '@/components/profile/NotificationSoundSettings';

interface SoundConfig {
  frequency: number;
  duration: number;
  wave: OscillatorType;
  pattern: 'single' | 'double' | 'triple';
  volume: number; // Added volume control
  envelope: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
}

const SOUND_CONFIGS: Record<NotificationSoundType, SoundConfig> = {
  alert: {
    frequency: 800,
    duration: 0.4,
    wave: 'square',
    pattern: 'double',
    volume: 0.8, // High volume for alerts
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.7, release: 0.2 }
  },
  chime: {
    frequency: 659.25,
    duration: 0.6,
    wave: 'sine',
    pattern: 'double',
    volume: 0.7,
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.6, release: 0.3 }
  },
  bell: {
    frequency: 880,
    duration: 0.8,
    wave: 'triangle',
    pattern: 'single',
    volume: 0.75,
    envelope: { attack: 0.001, decay: 0.1, sustain: 0.4, release: 0.5 }
  },
  ding: {
    frequency: 523.25,
    duration: 0.3,
    wave: 'sine',
    pattern: 'single',
    volume: 0.6,
    envelope: { attack: 0.01, decay: 0.05, sustain: 0.5, release: 0.2 }
  },
  notification: {
    frequency: 440,
    duration: 0.5,
    wave: 'triangle',
    pattern: 'double',
    volume: 0.7,
    envelope: { attack: 0.05, decay: 0.2, sustain: 0.4, release: 0.25 }
  }
};

// Check if device is mobile for volume boost
const isMobileDevice = () => {
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         window.innerWidth <= 768;
};

// Create AudioContext safely
const getAudioContext = (): AudioContext | null => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    
    return new AudioContextClass();
  } catch (error) {
    console.warn('Could not create AudioContext:', error);
    return null;
  }
};

// Enhanced mobile audio initialization with better user interaction handling
export const generateNotificationSound = async (
  soundType: NotificationSoundType,
  currentAudioRef?: React.MutableRefObject<HTMLAudioElement | null>,
  audioNodesRef?: React.MutableRefObject<Array<{ oscillator: OscillatorNode; gainNode: GainNode }>>
): Promise<void> => {
  console.log(`🔊 Starting generateNotificationSound for ${soundType}`);
  
  const config = SOUND_CONFIGS[soundType];
  if (!config) {
    console.warn(`❌ No config found for sound type: ${soundType}`);
    return;
  }

  const audioContext = getAudioContext();
  if (!audioContext) {
    console.warn('❌ AudioContext not available - cannot play sound');
    return;
  }

  try {
    console.log(`🎵 AudioContext state: ${audioContext.state}`);
    
    // CRITICAL: Resume context if suspended (mobile requirement)
    if (audioContext.state === 'suspended') {
      console.log('🔓 AudioContext suspended - attempting to resume...');
      await audioContext.resume();
      console.log(`🔓 AudioContext resume result: ${audioContext.state}`);
      
      // If still suspended after resume attempt, fail gracefully
      if (audioContext.state === 'suspended') {
        console.error('❌ AudioContext still suspended after resume attempt');
        return;
      }
    }

    const playTone = async (frequency: number, delay: number = 0) => {
      return new Promise<void>((resolve) => {
        setTimeout(async () => {
          try {
            console.log(`🎼 Playing tone: ${frequency}Hz with delay: ${delay}ms`);
            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            // Enhanced volume for mobile devices
            const baseVolume = config.volume;
            const mobileBoost = isMobileDevice() ? 1.5 : 1.0; // 50% volume boost for mobile
            const finalVolume = Math.min(1.0, baseVolume * mobileBoost);
            
            console.log(`🔊 Volume settings - base: ${baseVolume}, mobile boost: ${mobileBoost}, final: ${finalVolume}`);
            
            // Store nodes for cleanup
            if (audioNodesRef) {
              audioNodesRef.current.push({ oscillator, gainNode });
            }
            
            // Configure oscillator
            oscillator.type = config.wave;
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            
            // Enhanced envelope with mobile optimization
            const { attack, decay, sustain, release } = config.envelope;
            const now = audioContext.currentTime;
            
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(finalVolume, now + attack);
            gainNode.gain.linearRampToValueAtTime(finalVolume * sustain, now + attack + decay);
            gainNode.gain.setValueAtTime(finalVolume * sustain, now + config.duration - release);
            gainNode.gain.linearRampToValueAtTime(0, now + config.duration);
            
            // Connect nodes
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            console.log(`▶️ Starting oscillator at ${now}, stopping at ${now + config.duration}`);
            
            // Start and stop
            oscillator.start(now);
            oscillator.stop(now + config.duration);
            
            oscillator.onended = () => {
              console.log(`✅ Tone completed: ${frequency}Hz`);
              try {
                oscillator.disconnect();
                gainNode.disconnect();
              } catch (error) {
                console.warn('⚠️ Error disconnecting audio nodes:', error);
              }
              resolve();
            };
            
          } catch (error) {
            console.error('❌ Error in playTone:', error);
            resolve(); // Continue even if this tone fails
          }
        }, delay);
      });
    };

    // Play pattern based on configuration
    console.log(`🎵 Playing pattern: ${config.pattern}`);
    const promises: Promise<void>[] = [];
    
    if (config.pattern === 'single') {
      promises.push(playTone(config.frequency));
    } else if (config.pattern === 'double') {
      promises.push(playTone(config.frequency));
      promises.push(playTone(config.frequency, 200));
    } else if (config.pattern === 'triple') {
      promises.push(playTone(config.frequency));
      promises.push(playTone(config.frequency, 150));
      promises.push(playTone(config.frequency, 300));
    }
    
    await Promise.all(promises);
    
    console.log(`✅ Successfully played ${soundType} sound with mobile optimization (volume: ${isMobileDevice() ? 'boosted' : 'normal'})`);
    
  } catch (error) {
    console.error('❌ Failed to generate notification sound:', error);
    throw error;
  }
};

export const generateWebAudioTone = async (
  frequency: number = 440,
  duration: number = 0.5,
  currentAudioRef?: React.MutableRefObject<HTMLAudioElement | null>,
  audioNodesRef?: React.MutableRefObject<Array<{ oscillator: OscillatorNode; gainNode: GainNode }>>
): Promise<void> => {
  const audioContext = getAudioContext();
  if (!audioContext) return;

  try {
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Mobile volume boost
    const volume = isMobileDevice() ? 0.8 : 0.5;
    
    if (audioNodesRef) {
      audioNodesRef.current.push({ oscillator, gainNode });
    }
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    
    const now = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(now);
    oscillator.stop(now + duration);
    
    return new Promise<void>((resolve) => {
      oscillator.onended = () => {
        try {
          oscillator.disconnect();
          gainNode.disconnect();
        } catch (error) {
          // Already disconnected
        }
        resolve();
      };
    });
    
  } catch (error) {
    console.error('Failed to generate web audio tone:', error);
    throw error;
  }
};

export const generateDistinctSound = async (
  soundType: NotificationSoundType,
  audioNodesRef?: React.MutableRefObject<Array<{ oscillator: OscillatorNode; gainNode: GainNode }>>
): Promise<void> => {
  return generateNotificationSound(soundType, undefined, audioNodesRef);
};

// Export sound configurations for reference
export { SOUND_CONFIGS };
export type { SoundConfig };