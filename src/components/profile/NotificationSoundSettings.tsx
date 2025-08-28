import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Play, Square, Volume2, Check } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { generateDistinctSound } from "@/utils/soundGenerator";

// Notification sound types
export type NotificationSoundType = 'alert' | 'chime' | 'bell' | 'ding' | 'notification';

interface SoundOption {
  id: NotificationSoundType;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  audioFile?: string;
  frequency: number;
  pattern: 'single' | 'double' | 'triple';
  wave: 'sine' | 'square' | 'triangle';
}

const SOUND_OPTIONS: SoundOption[] = [
  {
    id: 'alert',
    name: 'เสียงแจ้งเตือน',
    nameEn: 'Alert',
    description: 'เสียงแจ้งเตือนคุณภาพสูงจากไฟล์ MP3',
    descriptionEn: 'High-quality alert sound from MP3 file',
    audioFile: '/sounds/alert-33762.mp3',
    frequency: 700,
    pattern: 'single',
    wave: 'square'
  },
  {
    id: 'chime',
    name: 'เสียงระฆัง',
    nameEn: 'Chime',
    description: 'เสียงระฆังสองจังหวะ โน้ต C5',
    descriptionEn: 'Double chime sound, C5 note',
    frequency: 523.25,
    pattern: 'double',
    wave: 'sine'
  },
  {
    id: 'bell',
    name: 'เสียงกระดิ่งสูง',
    nameEn: 'Bell',
    description: 'เสียงกระดิ่งโทนสูงชัดเจน โน้ต A5',
    descriptionEn: 'Clear high-tone bell, A5 note',
    frequency: 880,
    pattern: 'single',
    wave: 'triangle'
  },
  {
    id: 'ding',
    name: 'เสียงกระดิ่ง',
    nameEn: 'Ding',
    description: 'เสียงกระดิ่งเบา ๆ โน้ต E5',
    descriptionEn: 'Soft ding sound, E5 note',
    frequency: 659.25,
    pattern: 'single',
    wave: 'sine'
  },
  {
    id: 'notification',
    name: 'เสียงแจ้งเตือนนุ่ม',
    nameEn: 'Soft Notification',
    description: 'เสียงแจ้งเตือนสองจังหวะ โน้ต A4',
    descriptionEn: 'Gentle double-tone notification, A4 note',
    frequency: 440,
    pattern: 'double',
    wave: 'triangle'
  }
];

// Sound generator functions
export const generateNotificationSound = async (
  soundType: NotificationSoundType,
  audioRef?: React.MutableRefObject<HTMLAudioElement | null>,
  audioNodesRef?: React.MutableRefObject<Array<{ oscillator: OscillatorNode; gainNode: GainNode }>>
): Promise<void> => {
  const soundOption = SOUND_OPTIONS.find(option => option.id === soundType);
  if (!soundOption) return;

  try {
    // For the alert sound, use the actual audio file
    if (soundType === 'alert' && soundOption.audioFile) {
      const audio = new Audio(soundOption.audioFile);
      audio.volume = 0.8; // Increase volume for better audibility
      
      // Store reference for stopping later
      if (audioRef) {
        audioRef.current = audio;
      }
      
      // Handle mobile audio context requirements
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
      return;
    }

    // For other sounds, use the distinct sound generator for unique sounds
    await generateDistinctSound(soundType, audioNodesRef);
    
  } catch (error) {
    console.warn('Could not play notification sound:', error);
    throw error;
  }
};

const STORAGE_KEY = 'notification-sound-preference';

export const NotificationSoundSettings: React.FC = () => {
  const { t, language } = useTranslation();
  const [selectedSound, setSelectedSound] = useState<NotificationSoundType>('alert');
  const [playingSound, setPlayingSound] = useState<NotificationSoundType | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioNodesRef = useRef<Array<{ oscillator: OscillatorNode; gainNode: GainNode }>>([]);

  // Load saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SOUND_OPTIONS.find(option => option.id === saved)) {
      setSelectedSound(saved as NotificationSoundType);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSound();
    };
  }, []);

  // TEMPORARILY DISABLED FOR iOS PWA COMPATIBILITY
  const initializeAudioContext = async () => {
    console.log('Audio features temporarily disabled for iOS PWA compatibility');
    return false;
  };

  const stopSound = () => {
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
    
    // Reset state
    setIsPlaying(false);
    setPlayingSound(null);
  };

  const playPreview = async (soundType: NotificationSoundType) => {
    if (isPlaying) {
      // If currently playing, stop the sound
      stopSound();
      return;
    }
    
    try {
      setIsPlaying(true);
      setPlayingSound(soundType);
      
      // Ensure audio context is initialized
      await initializeAudioContext();
      
      // Add small delay to ensure context is ready
      await new Promise(resolve => setTimeout(resolve, 50));
      
      await generateNotificationSound(soundType, currentAudioRef, audioNodesRef);
      
      // For profile page preview, determine duration based on sound type configuration
      let soundDuration = 1000; // Default 1 second
      
      if (soundType === 'alert') {
        // MP3 file duration - estimate based on actual file
        soundDuration = 1200; // Give enough time for MP3 to play
      } else {
        // Web Audio API sounds - calculate based on pattern and duration
        const soundOption = SOUND_OPTIONS.find(option => option.id === soundType);
        if (soundOption) {
          // Use actual duration from sound config
          const baseDuration = soundOption.frequency === 659.25 ? 800 : // chime
                              soundOption.frequency === 880 ? 1000 :    // bell  
                              soundOption.frequency === 523.25 ? 400 :  // ding
                              soundOption.frequency === 440 ? 600 :     // notification
                              600; // default
          
          // Add pattern multiplier for double/triple sounds
          const patternMultiplier = soundOption.pattern === 'double' ? 1.4 : 
                                   soundOption.pattern === 'triple' ? 1.8 : 1.0;
          
          soundDuration = Math.ceil(baseDuration * patternMultiplier);
        }
      }
      
      // Reset playing state after actual sound duration (single play only)
      setTimeout(() => {
        if (playingSound === soundType) {
          setIsPlaying(false);
          setPlayingSound(null);
        }
      }, soundDuration);
      
    } catch (error) {
      setIsPlaying(false);
      setPlayingSound(null);
      console.error('Sound play error:', error);
      toast.error(language === 'th' ? 'ไม่สามารถเล่นเสียงได้' : 'Cannot play sound');
    }
  };

  const handleSoundChange = (soundType: NotificationSoundType) => {
    setSelectedSound(soundType);
    // Auto-save to localStorage
    localStorage.setItem(STORAGE_KEY, soundType);
    toast.success(
      language === 'th' 
        ? 'บันทึกการตั้งค่าเสียงแจ้งเตือนแล้ว' 
        : 'Notification sound saved'
    );
  };

  const getSoundName = (option: SoundOption) => {
    return language === 'th' ? option.name : option.nameEn;
  };

  const getSoundDescription = (option: SoundOption) => {
    return language === 'th' ? option.description : option.descriptionEn;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          {language === 'th' ? 'เสียงแจ้งเตือน' : 'Notification Sound'}
        </CardTitle>
        <CardDescription>
          {language === 'th' 
            ? 'เลือกเสียงที่ต้องการสำหรับการแจ้งเตือน' 
            : 'Choose your preferred notification sound'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup 
          value={selectedSound} 
          onValueChange={(value) => handleSoundChange(value as NotificationSoundType)}
          className="space-y-3"
        >
          {SOUND_OPTIONS.map((option) => (
            <div key={option.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="flex items-center space-x-3 flex-1">
                <RadioGroupItem value={option.id} id={option.id} />
                <div className="flex-1">
                  <Label htmlFor={option.id} className="text-base font-medium cursor-pointer">
                    {getSoundName(option)}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {getSoundDescription(option)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {selectedSound === option.id && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => playPreview(option.id)}
                  className="flex items-center gap-1"
                >
                  {playingSound === option.id && isPlaying ? (
                    <Square className="h-3 w-3" />
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                  {playingSound === option.id && isPlaying 
                    ? (language === 'th' ? 'หยุด' : 'Stop')
                    : (language === 'th' ? 'ฟัง' : 'Play')
                  }
                </Button>
              </div>
            </div>
          ))}
        </RadioGroup>
        
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {language === 'th' 
              ? 'การตั้งค่าจะถูกบันทึกอัตโนมัติเมื่อเลือกเสียง' 
              : 'Settings are automatically saved when you select a sound'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// Export function to get current sound preference
export const getCurrentNotificationSound = (): NotificationSoundType => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return (saved && SOUND_OPTIONS.find(option => option.id === saved)) 
    ? saved as NotificationSoundType 
    : 'alert'; // Default to the high-quality alert sound
};