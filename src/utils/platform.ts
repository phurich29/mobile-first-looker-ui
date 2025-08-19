import { Capacitor } from '@capacitor/core';

export interface PlatformInfo {
  isNative: boolean;
  isWeb: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  platform: string;
  supportsWebShare: boolean;
  supportsClipboard: boolean;
}

export const getPlatformInfo = (): PlatformInfo => {
  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform();
  
  // Check Web Share API support
  const supportsWebShare = typeof navigator !== 'undefined' && 
    'share' in navigator && 
    typeof navigator.share === 'function';
  
  // Check Clipboard API support
  const supportsClipboard = typeof navigator !== 'undefined' && 
    'clipboard' in navigator && 
    typeof navigator.clipboard?.writeText === 'function';

  return {
    isNative,
    isWeb: !isNative,
    isAndroid: platform === 'android',
    isIOS: platform === 'ios',
    platform,
    supportsWebShare,
    supportsClipboard
  };
};

export const getBaseUrl = (): string => {
  const platformInfo = getPlatformInfo();
  
  // Always use production URL for shared links, regardless of platform
  const productionUrl = 'https://setup.riceflow.app';
  
  // For development, check if we're in dev mode
  if (import.meta.env.DEV && platformInfo.isWeb) {
    // Only use localhost for web development
    return window.location.origin;
  }
  
  // Always return production URL for native apps and production builds
  return productionUrl;
};

export const isRunningInCapacitor = (): boolean => {
  return Capacitor.isNativePlatform();
};

export const getMobileUserAgent = (): string => {
  if (typeof navigator === 'undefined') return '';
  return navigator.userAgent;
};

export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = getMobileUserAgent();
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isSmallScreen = window.innerWidth < 768;
  
  return isMobileUA || isSmallScreen;
};