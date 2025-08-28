import { useEffect, useRef } from 'react';
import { generateNotificationSound, getCurrentNotificationSound, type NotificationSoundType } from '@/components/profile/NotificationSoundSettings';
import { storage } from '@/utils/storage';
import { getSafeAudioContext, canCreateAudioContext } from '@/utils/safeAudioContext';

export const NOTIFICATIONS_ENABLED_KEY = 'notifications-enabled';
export const getNotificationsEnabled = (): boolean => {
  try {
    const v = storage.getItem(NOTIFICATIONS_ENABLED_KEY);
    if (v === null) return true; // ค่าเริ่มต้น: เปิดแจ้งเตือน
    return v === 'true';
  } catch {
    return true;
  }
};

interface UseAlertSoundOptions {
  enabled?: boolean;
  playOnce?: boolean; // เล่นแค่ครั้งเดียวหรือวนลูป
  intervalMs?: number; // ช่วงเวลาระหว่างการเล่น (ถ้าไม่ใช่ playOnce)
  repeatCount?: number; // จำนวนครั้งที่เล่นต่อหนึ่งทริกเกอร์ (ดีฟอลต์ 1)
  repeatGapMs?: number; // เวลาพักระหว่างรอบ (หลังคลิปจบ) ดีฟอลต์ 1000ms
}

export const useAlertSound = (
  isAlertActive: boolean, 
  options: UseAlertSoundOptions = {}
) => {
  // TEMPORARILY DISABLED FOR iOS PWA COMPATIBILITY
  const { enabled = false, playOnce = true, intervalMs = 5000, repeatCount = 1, repeatGapMs = 1000 } = options;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const userInteractedRef = useRef<boolean>(false);
  const hasPlayedRef = useRef<boolean>(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioNodesRef = useRef<Array<{ oscillator: OscillatorNode; gainNode: GainNode }>>([]);
  const cancelChainRef = useRef<{ canceled: boolean }>({ canceled: false });
  const isChainRunningRef = useRef<boolean>(false);
  const instanceIdRef = useRef<string>(`owner_${Math.random().toString(36).slice(2)}_${Date.now()}`);

  // Global playback lock on window to prevent multi-source overlap
  const getGlobalLock = () => {
    const w = window as any;
    if (!w.__alertSoundLock) {
      w.__alertSoundLock = {
        running: false,
        ownerId: null as string | null,
        cancelRef: { canceled: false } as { canceled: boolean },
      };
    }
    return w.__alertSoundLock as {
      running: boolean;
      ownerId: string | null;
      cancelRef: { canceled: boolean };
    };
  };

  // Initialize audio context on user interaction for mobile compatibility
  const initializeAudioContext = async () => {
    try {
      // Use safe AudioContext wrapper
      const audioContext = await getSafeAudioContext();
      if (audioContext) {
        audioContextRef.current = audioContext;
        userInteractedRef.current = true;
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Could not initialize audio context:', error);
      return false;
    }
  };

  // Function to stop all currently playing sounds IMMEDIATELY
  const stopAllSounds = () => {
    // Stop MP3 audio immediately
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current.src = ''; // Clear source to prevent further loading
      currentAudioRef.current = null;
    }
    
    // Stop Web Audio API nodes with immediate gain reduction
    audioNodesRef.current.forEach(({ oscillator, gainNode }) => {
      try {
        // Immediately cut volume to 0
        gainNode.gain.cancelScheduledValues(audioContextRef.current?.currentTime || 0);
        gainNode.gain.setValueAtTime(0, audioContextRef.current?.currentTime || 0);
        
        // Stop oscillator immediately
        oscillator.stop(audioContextRef.current?.currentTime || 0);
        oscillator.disconnect();
        gainNode.disconnect();
      } catch (error) {
        // Oscillator might already be stopped - ignore error
      }
    });
    audioNodesRef.current = [];
    
    // Global emergency stop - find all audio elements and stop them
    document.querySelectorAll('audio').forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
      audio.src = '';
    });
  };

  // Function to play notification sound using the selected sound preference
  const playNotificationSound = async () => {
    try {
      // Only proceed if we can safely create AudioContext
      if (!canCreateAudioContext()) {
        console.log('⚠️ Cannot play sound - waiting for user interaction');
        return;
      }

      // Ensure audio context is initialized
      const initialized = await initializeAudioContext();
      if (!initialized) {
        console.log('⚠️ AudioContext initialization failed');
        return;
      }

      // Get the user's selected notification sound
      const selectedSound = getCurrentNotificationSound();
      
      // Use the new sound generation system with references for stopping
      // ป้องกันเสียงทับ: หยุดทุกเสียงก่อนเริ่มเสียงใหม่ในรอบนี้
      stopAllSounds();
      await generateNotificationSound(selectedSound, currentAudioRef, audioNodesRef);
      
    } catch (error) {
      console.warn('Could not play alert sound:', error);
    }
  };

  // Play N times sequentially, waiting for clip end + gap between plays
  const playSequentially = async (times: number) => {
    // Acquire global lock if available
    const lock = getGlobalLock();
    if (lock.running && lock.ownerId !== instanceIdRef.current) {
      // Another instance is already playing; ignore this request
      return;
    }
    lock.running = true;
    lock.ownerId = instanceIdRef.current;
    // Use the global cancelRef so others can cancel if they become owner later
    lock.cancelRef = { canceled: false };
    cancelChainRef.current = lock.cancelRef;
    isChainRunningRef.current = true;
    for (let i = 0; i < times; i++) {
      if (cancelChainRef.current.canceled) break;
      await playNotificationSound();

      // Wait until current audio finished if available
      let waited = false;
      const a = currentAudioRef.current;
      if (a) {
        await new Promise<void>((resolve) => {
          const onEnded = () => {
            a.removeEventListener('ended', onEnded);
            resolve();
          };
          // ถ้า duration ใช้ได้และ currentTime ใกล้จบ ให้ตั้ง timeout เผื่อกรณีไม่มี ended
          if (!isNaN(a.duration) && isFinite(a.duration)) {
            const remainMs = Math.max(0, (a.duration - a.currentTime) * 1000);
            const t = setTimeout(() => {
              a.removeEventListener('ended', onEnded);
              resolve();
            }, remainMs + 50);
            a.addEventListener('ended', () => {
              clearTimeout(t);
              onEnded();
            }, { once: true });
          } else {
            // ไม่มี duration (เช่น สร้างด้วย WebAudio) ใช้ค่าเผื่อ 4000ms
            setTimeout(() => resolve(), 4000);
          }
        });
        waited = true;
      } else {
        // ไม่พบ audio element ให้รอ 4 วินาทีโดยประมาณ (สำหรับ WebAudio)
        await new Promise((r) => setTimeout(r, 4000));
      }

      if (cancelChainRef.current.canceled) break;
      // Gap ระหว่างรอบ
      await new Promise((r) => setTimeout(r, repeatGapMs));
    }
    isChainRunningRef.current = false;
    // Release global lock only if we are still the owner
    const lock2 = getGlobalLock();
    if (lock2.ownerId === instanceIdRef.current) {
      lock2.running = false;
      lock2.ownerId = null;
    }
  };

  // Set up user interaction listeners for mobile compatibility
  useEffect(() => {
    // Check if AudioContext can be safely used
    if (!canCreateAudioContext()) {
      console.log('🎵 AudioContext not ready - waiting for user interaction');
    }

    const handleUserInteraction = async () => {
      const wasInteracted = userInteractedRef.current;
      if (!wasInteracted) {
        await initializeAudioContext();
      }
      // หากมีการโต้ตอบครั้งแรกและมีการเตือนที่ active อยู่ ให้เล่นเสียงทันที
      if (isAlertActive && enabled && !hasPlayedRef.current && canCreateAudioContext()) {
        try {
          await playNotificationSound();
          hasPlayedRef.current = true;
        } catch {}
      }
    };

    // Add listeners for various user interaction events
    const events = ['click', 'touchstart', 'touchend', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true, passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [isAlertActive, enabled]);

  useEffect(() => {
    // TEMPORARILY DISABLED FOR iOS PWA COMPATIBILITY
    // Only play sound if both alert is active AND notifications are enabled
    if (false && isAlertActive && enabled) {
      // Reset the played flag when alert becomes active
      hasPlayedRef.current = false;
      
      // หากมี chain อื่นกำลังเล่นอยู่ (จากอีกคอมโพเนนต์) ให้ข้าม ไม่เริ่มซ้อน
      const lock = getGlobalLock();
      if (lock.running && lock.ownerId !== instanceIdRef.current) {
        return;
      }
      // ถ้าเราเป็นเจ้าของเดิม ให้ยกเลิก chain เดิมก่อนเริ่มใหม่
      if (lock.ownerId === instanceIdRef.current) {
        lock.cancelRef.canceled = true;
        stopAllSounds();
      }
      // เริ่ม chain ใหม่แบบ sequential เท่านั้น และยึดล็อคแบบ global
      playSequentially(Math.max(1, repeatCount));
      hasPlayedRef.current = true;
      
      if (playOnce) {
        // Single play mode: just play once and stop
        // No need to set up any timer
      } else {
        // Continuous play mode: set up interval to repeat
        timerRef.current = setInterval(() => {
          playNotificationSound();
        }, intervalMs);
      }
    } else {
      // 🚨 IMMEDIATE STOP: Clear timer and stop all sounds ASAP
      if (timerRef.current) {
        if (playOnce) {
          clearTimeout(timerRef.current);
        } else {
          clearInterval(timerRef.current);
        }
        timerRef.current = null;
      }
      
      // 🔇 FORCE STOP: Stop all currently playing sounds immediately
      stopAllSounds();
      
      // Cancel any pending chains immediately
      cancelChainRef.current.canceled = true;
      isChainRunningRef.current = false;
      
      // Reset played flag when alert becomes inactive
      hasPlayedRef.current = false;
      
      // Release global lock if we own it
      const lock = getGlobalLock();
      if (lock.ownerId === instanceIdRef.current) {
        lock.running = false;
        lock.ownerId = null;
        lock.cancelRef.canceled = true;
      }
    }

    // Cleanup on unmount or when effect dependencies change
    return () => {
      // 🚨 CLEANUP: Stop everything immediately
      if (timerRef.current) {
        if (playOnce) {
          clearTimeout(timerRef.current);
        } else {
          clearInterval(timerRef.current);
        }
        timerRef.current = null;
      }
      
      // Force stop all sounds
      stopAllSounds();
      
      // Cancel chains
      cancelChainRef.current.canceled = true;
      isChainRunningRef.current = false;
      
      // Release global lock
      const lock = getGlobalLock();
      if (lock.ownerId === instanceIdRef.current) {
        lock.running = false;
        lock.ownerId = null;
        lock.cancelRef.canceled = true;
      }
    };
  }, [isAlertActive, enabled, playOnce, intervalMs, repeatCount, repeatGapMs]);

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      // Stop all sounds before closing context
      stopAllSounds();
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);
};