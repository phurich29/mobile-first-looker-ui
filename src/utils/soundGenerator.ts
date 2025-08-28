// Sound generator utility for creating different notification sounds
// TEMPORARILY DISABLED FOR iOS PWA COMPATIBILITY
import { NotificationSoundType } from '@/components/profile/NotificationSoundSettings';

interface SoundConfig {
  frequency: number;
  duration: number;
  wave: OscillatorType;
  pattern: 'single' | 'double' | 'triple';
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
    duration: 0.3,
    wave: 'square',
    pattern: 'single',
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.2 }
  },
  chime: {
    frequency: 659.25,
    duration: 0.8,
    wave: 'sine',
    pattern: 'double',
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.2 }
  },
  bell: {
    frequency: 880,
    duration: 1.0,
    wave: 'triangle',
    pattern: 'single',
    envelope: { attack: 0.001, decay: 0.1, sustain: 0.2, release: 0.9 }
  },
  ding: {
    frequency: 523.25,
    duration: 0.4,
    wave: 'sine',
    pattern: 'single',
    envelope: { attack: 0.01, decay: 0.05, sustain: 0.4, release: 0.15 }
  },
  notification: {
    frequency: 440,
    duration: 0.6,
    wave: 'triangle',
    pattern: 'double',
    envelope: { attack: 0.05, decay: 0.2, sustain: 0.3, release: 0.25 }
  }
};

// TEMPORARILY DISABLED FOR iOS PWA COMPATIBILITY
export const generateNotificationSound = async (
  soundType: NotificationSoundType,
  currentAudioRef?: React.MutableRefObject<HTMLAudioElement | null>,
  audioNodesRef?: React.MutableRefObject<Array<{ oscillator: OscillatorNode; gainNode: GainNode }>>
): Promise<void> => {
  console.log('🔇 Audio features temporarily disabled for iOS PWA compatibility');
  return;
};

export const generateWebAudioTone = async (
  frequency: number = 440,
  duration: number = 0.5,
  currentAudioRef?: React.MutableRefObject<HTMLAudioElement | null>,
  audioNodesRef?: React.MutableRefObject<Array<{ oscillator: OscillatorNode; gainNode: GainNode }>>
): Promise<void> => {
  console.log('🔇 Audio features temporarily disabled for iOS PWA compatibility');
  return;
};

export const generateDistinctSound = async (
  soundType: NotificationSoundType,
  audioNodesRef?: React.MutableRefObject<Array<{ oscillator: OscillatorNode; gainNode: GainNode }>>
): Promise<void> => {
  console.log('🔇 Audio features temporarily disabled for iOS PWA compatibility');
  return;
};

// Export sound configurations for reference
export { SOUND_CONFIGS };
export type { SoundConfig };