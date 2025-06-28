
import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  userAgent: string;
  isIOS: boolean;
  isAndroid: boolean;
  isSafari: boolean;
  isChrome: boolean;
  supportsInstallPrompt: boolean;
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = React.useState<DeviceInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        userAgent: '',
        isIOS: false,
        isAndroid: false,
        isSafari: false,
        isChrome: false,
        supportsInstallPrompt: false,
      };
    }

    const width = window.innerWidth;
    const userAgent = navigator.userAgent;
    
    const isMobile = width < MOBILE_BREAKPOINT;
    const isTablet = width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT;
    const isDesktop = width >= TABLET_BREAKPOINT;
    
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    const isChrome = /Chrome/.test(userAgent);
    
    // Check if browser supports install prompt
    const supportsInstallPrompt = 'serviceWorker' in navigator && 'PushManager' in window;

    return {
      isMobile,
      isTablet,
      isDesktop,
      userAgent,
      isIOS,
      isAndroid,
      isSafari,
      isChrome,
      supportsInstallPrompt,
    };
  });

  React.useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const userAgent = navigator.userAgent;
      
      const isMobile = width < MOBILE_BREAKPOINT;
      const isTablet = width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT;
      const isDesktop = width >= TABLET_BREAKPOINT;
      
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isAndroid = /Android/.test(userAgent);
      const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
      const isChrome = /Chrome/.test(userAgent);
      
      const supportsInstallPrompt = 'serviceWorker' in navigator && 'PushManager' in window;

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        userAgent,
        isIOS,
        isAndroid,
        isSafari,
        isChrome,
        supportsInstallPrompt,
      });
    };

    const mediaQuery = window.matchMedia(`(max-width: ${TABLET_BREAKPOINT - 1}px)`);
    mediaQuery.addEventListener("change", updateDeviceInfo);
    
    return () => mediaQuery.removeEventListener("change", updateDeviceInfo);
  }, []);

  return deviceInfo;
}
