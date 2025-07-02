
import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export interface PWAInstallState {
  canInstall: boolean;
  isInstalled: boolean;
  isInstalling: boolean;
  isIOS: boolean;
  isIOSPWACompatible: boolean;
  installApp: () => Promise<void>;
  dismissInstallPrompt: () => void;
  hasBeenDismissed: boolean;
  resetDismissedStatus: () => void;
}

export function usePWAInstall(): PWAInstallState {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isIOSPWACompatible, setIsIOSPWACompatible] = useState(false);

  useEffect(() => {
    // Detect iOS
    const detectIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIOSDevice = /ipad|iphone|ipod/.test(userAgent);
      setIsIOS(isIOSDevice);
      
      // Check iOS PWA compatibility (iOS 11.3+)
      if (isIOSDevice) {
        const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as any).standalone;
        const isIOSSafari = /safari/.test(userAgent) && !/chrome|crios|fxios|edgios/.test(userAgent);
        const supportsPWA = 'serviceWorker' in navigator && 'PushManager' in window;
        
        setIsIOSPWACompatible(supportsPWA && isIOSSafari && !isInStandaloneMode);
      }
    };

    // Check if app is already installed
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isIOSStandalone);
    };

    // Check if user has previously dismissed the install prompt
    const checkDismissedStatus = () => {
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (dismissed) {
        const dismissedDate = new Date(dismissed);
        const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
        // Show prompt again after 1 day for better user experience
        if (daysSinceDismissed < 1) {
          setHasBeenDismissed(true);
        } else {
          localStorage.removeItem('pwa-install-dismissed');
        }
      }
    };

    detectIOS();
    checkIfInstalled();
    checkDismissedStatus();

    // Listen for beforeinstallprompt event (Android/Desktop only)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const installEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(installEvent);
      setCanInstall(true);
      console.log('PWA install prompt ready');
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
      localStorage.removeItem('pwa-install-dismissed');
    };

    // Only add beforeinstallprompt listener for non-iOS devices
    if (!isIOS) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }
    
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      if (!isIOS) {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      }
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isIOS]);

  // Set canInstall based on platform
  useEffect(() => {
    if (isInstalled || hasBeenDismissed) {
      setCanInstall(false);
      return;
    }

    if (isIOS) {
      // For iOS, show install prompt if PWA compatible and not in standalone mode
      setCanInstall(isIOSPWACompatible);
    } else {
      // For other platforms, use deferredPrompt
      setCanInstall(!!deferredPrompt);
    }
  }, [isIOS, isIOSPWACompatible, isInstalled, hasBeenDismissed, deferredPrompt]);

  const installApp = async (): Promise<void> => {
    if (isIOS) {
      // For iOS, we can't programmatically trigger install
      // The banner will show instructions instead
      console.log('iOS install instructions will be shown');
      return;
    }

    if (!deferredPrompt) {
      console.log('No install prompt available');
      return;
    }

    setIsInstalling(true);

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      console.log('User choice:', choiceResult.outcome);
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
        dismissInstallPrompt();
      }
    } catch (error) {
      console.error('Error during app installation:', error);
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
      setCanInstall(false);
    }
  };

  const dismissInstallPrompt = (): void => {
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
    setHasBeenDismissed(true);
    setCanInstall(false);
    console.log('Install prompt dismissed');
  };

  const resetDismissedStatus = (): void => {
    localStorage.removeItem('pwa-install-dismissed');
    setHasBeenDismissed(false);
    console.log('PWA install dismissed status reset');
  };

  return {
    canInstall,
    isInstalled,
    isInstalling,
    isIOS,
    isIOSPWACompatible,
    installApp,
    dismissInstallPrompt,
    hasBeenDismissed,
    resetDismissedStatus,
  };
}
