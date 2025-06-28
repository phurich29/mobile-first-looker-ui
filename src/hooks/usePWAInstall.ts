
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
  installApp: () => Promise<void>;
  dismissInstallPrompt: () => void;
  hasBeenDismissed: boolean;
}

export function usePWAInstall(): PWAInstallState {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false);

  useEffect(() => {
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
        // Show prompt again after 7 days
        if (daysSinceDismissed < 7) {
          setHasBeenDismissed(true);
        } else {
          localStorage.removeItem('pwa-install-dismissed');
        }
      }
    };

    checkIfInstalled();
    checkDismissedStatus();

    // Listen for beforeinstallprompt event
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

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async (): Promise<void> => {
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

  return {
    canInstall: canInstall && !hasBeenDismissed && !isInstalled,
    isInstalled,
    isInstalling,
    installApp,
    dismissInstallPrompt,
    hasBeenDismissed,
  };
}
