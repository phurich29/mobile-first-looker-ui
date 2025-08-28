import { useEffect, useRef, useCallback } from 'react';
import { mobileAudioService } from '@/services/MobileAudioService';
import { getNotificationsEnabled } from '@/hooks/useAlertSound';
import { type NotificationSoundType } from '@/components/profile/NotificationSoundSettings';

interface UseMobileNotificationSoundOptions {
  enabled?: boolean;
  soundType?: NotificationSoundType;
  playOnce?: boolean;
  repeatCount?: number;
  repeatInterval?: number;
}

export const useMobileNotificationSound = (
  isAlertActive: boolean,
  options: UseMobileNotificationSoundOptions = {}
) => {
  const {
    enabled = true,
    soundType,
    playOnce = true,
    repeatCount = 1,
    repeatInterval = 2000
  } = options;

  const hasPlayedRef = useRef<boolean>(false);
  const isInitializedRef = useRef<boolean>(false);
  const repeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const instanceIdRef = useRef<string>(`sound_${Date.now()}_${Math.random()}`);

  // Initialize audio service
  useEffect(() => {
    const initializeAudio = async () => {
      if (!isInitializedRef.current) {
        console.log('🎵 Initializing mobile notification sound service');
        const success = await mobileAudioService.initialize();
        if (success) {
          isInitializedRef.current = true;
          console.log('✅ Mobile notification sound service ready');
        } else {
          console.warn('⚠️ Failed to initialize mobile notification sound service');
        }
      }
    };

    initializeAudio();
  }, []);

  // Play notification sound
  const playSound = useCallback(async () => {
    const notificationsEnabled = getNotificationsEnabled();
    
    if (!enabled || !notificationsEnabled || !isInitializedRef.current) {
      return;
    }

    try {
      console.log('🔔 Playing mobile notification sound');
      await mobileAudioService.playNotificationSound(soundType);
    } catch (error) {
      console.error('❌ Failed to play mobile notification sound:', error);
    }
  }, [enabled, soundType]);

  // Play sound multiple times with interval
  const playRepeated = useCallback(async (times: number) => {
    for (let i = 0; i < times; i++) {
      await playSound();
      
      // Wait between repetitions (except for the last one)
      if (i < times - 1) {
        await new Promise(resolve => setTimeout(resolve, repeatInterval));
      }
    }
  }, [playSound, repeatInterval]);

  // Handle alert state changes
  useEffect(() => {
    const handleAlertChange = async () => {
      if (isAlertActive && enabled && getNotificationsEnabled()) {
        // Reset played flag when alert becomes active
        hasPlayedRef.current = false;

        if (playOnce && !hasPlayedRef.current) {
          // Play once mode
          await playRepeated(repeatCount);
          hasPlayedRef.current = true;
        } else if (!playOnce) {
          // Continuous mode - play repeatedly
          await playRepeated(repeatCount);
          
          // Set up interval for continuous play
          repeatTimerRef.current = setInterval(async () => {
            if (isAlertActive && enabled && getNotificationsEnabled()) {
              await playRepeated(repeatCount);
            }
          }, repeatInterval * repeatCount + 1000); // Add buffer between cycles
        }
      } else {
        // Stop all sounds when alert becomes inactive
        if (repeatTimerRef.current) {
          clearInterval(repeatTimerRef.current);
          repeatTimerRef.current = null;
        }
        
        mobileAudioService.stopAllSounds();
        hasPlayedRef.current = false;
      }
    };

    handleAlertChange();

    // Cleanup function
    return () => {
      if (repeatTimerRef.current) {
        clearInterval(repeatTimerRef.current);
        repeatTimerRef.current = null;
      }
      mobileAudioService.stopAllSounds();
    };
  }, [isAlertActive, enabled, playOnce, repeatCount, playSound, playRepeated]);

  // Test audio function for user testing
  const testAudio = useCallback(async () => {
    try {
      console.log('🎵 Testing mobile audio...');
      const result = await mobileAudioService.testAudio();
      return result;
    } catch (error) {
      console.error('Audio test failed:', error);
      return false;
    }
  }, []);

  // Get audio info for debugging
  const getAudioInfo = useCallback(() => {
    return mobileAudioService.getAudioInfo();
  }, []);

  return {
    playSound,
    testAudio,
    getAudioInfo,
    isInitialized: isInitializedRef.current
  };
};