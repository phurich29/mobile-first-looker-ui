// Sound generator utility for creating different notification sounds
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
    frequency: 659.25, // E5 note - higher pitch for better audibility
    duration: 0.8,
    wave: 'sine',
    pattern: 'double',
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.2 }
  },
  bell: {
    frequency: 880, // A5 note
    duration: 1.0,
    wave: 'triangle',
    pattern: 'single',
    envelope: { attack: 0.001, decay: 0.1, sustain: 0.2, release: 0.9 }
  },
  ding: {
    frequency: 523.25, // C5 note - softer than chime
    duration: 0.4,
    wave: 'sine',
    pattern: 'single',
    envelope: { attack: 0.01, decay: 0.05, sustain: 0.4, release: 0.15 }
  },
  notification: {
    frequency: 440, // A4 note
    duration: 0.6,
    wave: 'triangle',
    pattern: 'double',
    envelope: { attack: 0.05, decay: 0.2, sustain: 0.3, release: 0.25 }
  }
};

export const generateDistinctSound = async (
  soundType: NotificationSoundType,
  audioNodesRef?: React.MutableRefObject<Array<{ oscillator: OscillatorNode; gainNode: GainNode }>>
): Promise<void> => {
  const config = SOUND_CONFIGS[soundType];
  if (!config) {
    console.warn(`Unknown sound type: ${soundType}`);
    return;
  }

  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Resume audio context if suspended
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const createTone = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, startTime);
      oscillator.type = config.wave;
      
      // ADSR Envelope
      const { attack, decay, sustain, release } = config.envelope;
      const peakTime = startTime + attack;
      const decayTime = peakTime + decay;
      const releaseStartTime = startTime + duration - release;
      
      // Adjust volume based on sound type - chime needs extra boost
      const peakVolume = soundType === 'chime' ? 0.8 : 0.6;
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(peakVolume, peakTime);
      gainNode.gain.exponentialRampToValueAtTime(sustain, decayTime);
      gainNode.gain.setValueAtTime(sustain, releaseStartTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
      
      // Store reference for stopping later
      if (audioNodesRef) {
        audioNodesRef.current.push({ oscillator, gainNode });
      }
      
      return { oscillator, gainNode };
    };

    const now = audioContext.currentTime;
    
    // Clear previous audio nodes
    if (audioNodesRef) {
      audioNodesRef.current = [];
    }
    
    // Create sound pattern based on configuration (single play cycle only)
    switch (config.pattern) {
      case 'single':
        createTone(config.frequency, now, config.duration);
        break;
        
      case 'double':
        // Play two tones in sequence for richer sound
        createTone(config.frequency, now, config.duration * 0.6);
        createTone(config.frequency * 1.2, now + config.duration * 0.7, config.duration * 0.6);
        break;
        
      case 'triple':
        // Play three tones in sequence for complex sound
        createTone(config.frequency, now, config.duration * 0.4);
        createTone(config.frequency * 1.1, now + config.duration * 0.5, config.duration * 0.4);
        createTone(config.frequency * 1.25, now + config.duration * 1.0, config.duration * 0.4);
        break;
    }

    // Add harmonic for richer sound (including chime for better audibility)
    if ((config.wave !== 'sine' && soundType !== 'ding') || soundType === 'chime') {
      const harmonicFreq = config.frequency * 2;
      const harmonicGain = soundType === 'chime' ? 0.25 : 0.15; // Extra harmonic for chime
      
      const harmonicOsc = audioContext.createOscillator();
      const harmonicGainNode = audioContext.createGain();
      
      harmonicOsc.connect(harmonicGainNode);
      harmonicGainNode.connect(audioContext.destination);
      
      harmonicOsc.frequency.setValueAtTime(harmonicFreq, now);
      harmonicOsc.type = 'sine';
      
      harmonicGainNode.gain.setValueAtTime(0, now);
      harmonicGainNode.gain.linearRampToValueAtTime(harmonicGain * 1.5, now + 0.01); // Increase harmonic volume
      harmonicGainNode.gain.exponentialRampToValueAtTime(0.001, now + config.duration);
      
      harmonicOsc.start(now);
      harmonicOsc.stop(now + config.duration);
      
      // Store harmonic reference for stopping later
      if (audioNodesRef) {
        audioNodesRef.current.push({ oscillator: harmonicOsc, gainNode: harmonicGainNode });
      }
    }

  } catch (error) {
    console.warn('Could not generate distinct sound:', error);
    throw error;
  }
};

// Export sound configurations for reference
export { SOUND_CONFIGS };
export type { SoundConfig };