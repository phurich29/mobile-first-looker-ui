import { Capacitor } from '@capacitor/core';
import { generateNotificationSound, getCurrentNotificationSound, type NotificationSoundType } from '@/components/profile/NotificationSoundSettings';

export class MobileAudioService {
  private static instance: MobileAudioService;
  private audioContext: AudioContext | null = null;
  private isInitialized = false;
  private soundQueue: Array<() => Promise<void>> = [];
  private isPlaying = false;

  private constructor() {}

  public static getInstance(): MobileAudioService {
    if (!MobileAudioService.instance) {
      MobileAudioService.instance = new MobileAudioService();
    }
    return MobileAudioService.instance;
  }

  /**
   * Initialize audio service for mobile platforms
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // Check if we're on a mobile platform
      if (Capacitor.isNativePlatform()) {
        console.log('🎵 Initializing native mobile audio service');
        
        // For native platforms, we can create AudioContext directly
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Request audio permissions if needed
        if (this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
        }
        
        this.isInitialized = true;
        console.log('✅ Mobile audio service initialized successfully');
        return true;
      } else {
        console.log('🌐 Web platform detected, using web audio fallback');
        // For web platform, still initialize but with user interaction requirement
        return await this.initWebAudioFallback();
      }
    } catch (error) {
      console.error('❌ Failed to initialize mobile audio service:', error);
      return false;
    }
  }

  /**
   * Fallback initialization for web platforms
   */
  private async initWebAudioFallback(): Promise<boolean> {
    try {
      // Create audio context with user gesture requirement
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Add click listener to resume context
      const resumeContext = async () => {
        if (this.audioContext && this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
          this.isInitialized = true;
          console.log('✅ Web audio context resumed after user interaction');
        }
      };

      // Listen for user interactions to activate audio
      document.addEventListener('touchstart', resumeContext, { once: true });
      document.addEventListener('click', resumeContext, { once: true });
      document.addEventListener('keydown', resumeContext, { once: true });
      
      return true;
    } catch (error) {
      console.error('❌ Web audio fallback failed:', error);
      return false;
    }
  }

  /**
   * Play notification sound with mobile optimization
   */
  public async playNotificationSound(soundType?: NotificationSoundType): Promise<void> {
    if (!this.isInitialized && !(await this.initialize())) {
      console.warn('⚠️ Audio service not initialized');
      return;
    }

    const selectedSound = soundType || getCurrentNotificationSound();
    
    // Add to queue to prevent overlapping sounds
    return new Promise<void>((resolve, reject) => {
      this.soundQueue.push(async () => {
        try {
          await this.playSound(selectedSound);
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  /**
   * Process sound queue to prevent overlapping
   */
  private async processQueue(): Promise<void> {
    if (this.isPlaying || this.soundQueue.length === 0) return;

    this.isPlaying = true;
    
    while (this.soundQueue.length > 0) {
      const soundTask = this.soundQueue.shift();
      if (soundTask) {
        try {
          await soundTask();
          // Add small delay between sounds
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.error('Error playing queued sound:', error);
        }
      }
    }

    this.isPlaying = false;
  }

  /**
   * Play individual sound with platform-specific optimization
   */
  private async playSound(soundType: NotificationSoundType): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        // Use native audio capabilities for better performance
        await this.playNativeSound(soundType);
      } else {
        // Use web audio for browser
        await this.playWebSound(soundType);
      }
    } catch (error) {
      console.error('Failed to play sound:', error);
      throw error;
    }
  }

  /**
   * Play sound using native platform capabilities
   */
  private async playNativeSound(soundType: NotificationSoundType): Promise<void> {
    // For native platforms, we can use the existing generateNotificationSound
    // but with enhanced volume and better mobile optimization
    const audioRef = { current: null as HTMLAudioElement | null };
    const audioNodesRef = { current: [] as Array<{ oscillator: OscillatorNode; gainNode: GainNode }> };

    await generateNotificationSound(soundType, audioRef, audioNodesRef);

    // Enhance volume for mobile devices
    if (audioRef.current) {
      audioRef.current.volume = Math.min(1.0, audioRef.current.volume * 1.2);
    }

    // Wait for sound to complete
    return new Promise<void>((resolve) => {
      if (audioRef.current) {
        const audio = audioRef.current;
        const cleanup = () => {
          audio.removeEventListener('ended', onEnded);
          audio.removeEventListener('error', onError);
          resolve();
        };

        const onEnded = cleanup;
        const onError = cleanup;

        audio.addEventListener('ended', onEnded, { once: true });
        audio.addEventListener('error', onError, { once: true });

        // Fallback timeout
        setTimeout(cleanup, 5000);
      } else {
        // For WebAudio-generated sounds, estimate duration
        setTimeout(resolve, 2000);
      }
    });
  }

  /**
   * Play sound using web audio API
   */
  private async playWebSound(soundType: NotificationSoundType): Promise<void> {
    // Use existing web audio implementation
    const audioRef = { current: null as HTMLAudioElement | null };
    const audioNodesRef = { current: [] as Array<{ oscillator: OscillatorNode; gainNode: GainNode }> };

    await generateNotificationSound(soundType, audioRef, audioNodesRef);

    // Return promise that resolves when sound completes
    return new Promise<void>((resolve) => {
      setTimeout(resolve, 2000); // Estimated duration
    });
  }

  /**
   * Stop all currently playing sounds
   */
  public stopAllSounds(): void {
    // Clear the queue
    this.soundQueue = [];
    this.isPlaying = false;

    // Stop all audio elements
    document.querySelectorAll('audio').forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });

    // Stop web audio nodes
    if (this.audioContext) {
      try {
        // We don't have direct access to the nodes here, but the generateNotificationSound
        // function should handle cleanup in its own scope
        console.log('🔇 Stopping all mobile audio sounds');
      } catch (error) {
        console.warn('Error stopping audio nodes:', error);
      }
    }
  }

  /**
   * Test if audio is available and working
   */
  public async testAudio(): Promise<boolean> {
    try {
      await this.initialize();
      await this.playNotificationSound('ding');
      return true;
    } catch (error) {
      console.error('Audio test failed:', error);
      return false;
    }
  }

  /**
   * Get audio capabilities info
   */
  public getAudioInfo(): { platform: string; initialized: boolean; nativeSupport: boolean } {
    return {
      platform: Capacitor.getPlatform(),
      initialized: this.isInitialized,
      nativeSupport: Capacitor.isNativePlatform()
    };
  }
}

// Export singleton instance
export const mobileAudioService = MobileAudioService.getInstance();