
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PWAContextValue {
  isOnline: boolean;
  needRefresh: boolean;
  offlineReady: boolean;
  updateServiceWorker: () => void;
  clearAllCache: () => Promise<void>;
  appVersion: string;
  performanceMetrics: {
    pageLoadTime: number;
    componentStuckCount: number;
    networkFailureCount: number;
    lastAutoRecovery: number | null;
  };
}

const PWAContext = createContext<PWAContextValue | undefined>(undefined);

export const usePWAContext = () => {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error('usePWAContext must be used within a PWAProvider');
  }
  return context;
};

interface PWAProviderProps {
  children: React.ReactNode;
}

export const PWAProvider: React.FC<PWAProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [appVersion] = useState(() => {
    // Generate app version based on build time or use a fixed version
    return `${Date.now()}`;
  });

  // Performance Monitoring States
  const [performanceMetrics, setPerformanceMetrics] = useState({
    pageLoadTime: 0,
    componentStuckCount: 0,
    networkFailureCount: 0,
    lastAutoRecovery: null as number | null,
  });
  const [loadingStates] = useState(new Map<string, number>());
  const [networkFailures] = useState(new Map<string, number>());
  
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
    onNeedRefresh() {
      console.log('SW needs refresh');
      setNeedRefresh(true);
      toast({
        title: 'อัปเดตใหม่พร้อมใช้งาน',
        description: 'การอัปเดตนี้จะทำให้คุณต้องเข้าสู่ระบบใหม่',
        duration: 0, // Don't auto-dismiss
        action: (
          <button
            onClick={() => handleUpdate()}
            className="bg-emerald-600 text-white px-3 py-1 rounded text-sm hover:bg-emerald-700"
          >
            อัปเดตเลย
          </button>
        ),
      });
    },
    onOfflineReady() {
      console.log('SW offline ready');
      setOfflineReady(true);
      toast({
        title: 'แอปพร้อมใช้งานแบบออฟไลน์',
        description: 'ตัวแอปพร้อมทำงานแม้ไม่มีอินเทอร์เน็ต',
        duration: 5000,
      });
    },
  });

  const clearAuthCache = async (forceSignOut: boolean = false) => {
    try {
      console.log('Clearing authentication cache...', { forceSignOut });
      
      // ตรวจสอบสถานะ session ปัจจุบัน
      const { data: { session } } = await supabase.auth.getSession();
      const isUserLoggedIn = !!session?.user;
      
      console.log('Current auth state:', { isUserLoggedIn, forceSignOut });
      
      // ถ้า user ยัง login อยู่และไม่ได้บังคับให้ sign out ให้ skip การ clear cache
      if (isUserLoggedIn && !forceSignOut) {
        console.log('User is logged in, skipping auth cache clear to prevent auto logout');
        
        // Clear เฉพาะ cache ที่ไม่เกี่ยวกับ auth
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          for (const cacheName of cacheNames) {
            // Clear เฉพาะ cache ที่ไม่ใช่ auth
            if (!cacheName.includes('supabase-auth') && !cacheName.includes('auth')) {
              await caches.delete(cacheName);
              console.log(`Cleared non-auth cache: ${cacheName}`);
            }
          }
        }
        return;
      }
      
      // ดำเนินการ clear cache ปกติเฉพาะเมื่อ user ไม่ได้ login หรือบังคับให้ sign out
      console.log('Proceeding with full auth cache clear');
      
      // Clear all localStorage items related to auth
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('auth') || key.includes('session'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Clear sessionStorage as well
      const sessionKeysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('auth') || key.includes('session'))) {
          sessionKeysToRemove.push(key);
        }
      }
      sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
      
      // Sign out from Supabase to clear any cached sessions
      await supabase.auth.signOut();
      
      // Clear service worker caches related to auth
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          if (cacheName.includes('supabase') || cacheName.includes('auth')) {
            await caches.delete(cacheName);
            console.log(`Cleared cache: ${cacheName}`);
          }
        }
      }
      
      console.log('Authentication cache cleared successfully');
    } catch (error) {
      console.error('Error clearing auth cache:', error);
    }
  };

  const clearAllCache = async () => {
    try {
      console.log('Starting clear all cache process...');
      
      // บันทึก auth session และ last device ก่อน clear
      const { data: { session } } = await supabase.auth.getSession();
      const lastDevice = localStorage.getItem('selectedDevice') || localStorage.getItem('lastDevice');
      
      // Clear ทุก cache ยกเว้น auth และ device selection
      const protectedKeys = ['selectedDevice', 'lastDevice'];
      
      // Clear localStorage ยกเว้น protected keys และ auth
      const localKeysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && 
            !key.includes('supabase') && 
            !key.includes('auth-token') && 
            !protectedKeys.includes(key)) {
          localKeysToRemove.push(key);
        }
      }
      localKeysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Clear sessionStorage ยกเว้น auth
      const sessionKeysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && 
            !key.includes('supabase') && 
            !key.includes('auth-token')) {
          sessionKeysToRemove.push(key);
        }
      }
      sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
      
      // Clear service worker caches ทั้งหมด
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          await caches.delete(cacheName);
          console.log(`Cleared cache: ${cacheName}`);
        }
      }
      
      // Unregister และ register service worker ใหม่
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
          console.log('Unregistered service worker');
        }
        
        // Re-register service worker หลังจาก delay เล็กน้อย
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
      
      // Restore last device ถ้ามี
      if (lastDevice) {
        localStorage.setItem('selectedDevice', lastDevice);
      }
      
      console.log('All cache cleared successfully while preserving auth and device selection');
    } catch (error) {
      console.error('Error clearing all cache:', error);
      throw error;
    }
  };

  // Auto Cache Clear System Functions
  const performAutoRecovery = async (reason: string) => {
    try {
      console.log(`🚨 Auto recovery triggered: ${reason}`);
      
      toast({
        title: 'ตรวจพบปัญหาการโหลด',
        description: 'กำลังแก้ไขอัตโนมัติ กรุณารอสักครู่...',
        duration: 3000,
      });

      // บันทึกเวลาที่ทำ auto recovery
      setPerformanceMetrics(prev => ({
        ...prev,
        lastAutoRecovery: Date.now()
      }));

      // Clear cache แต่เก็บ auth และ device selection
      await clearAllCache();
      
      console.log('✅ Auto recovery completed successfully');
    } catch (error) {
      console.error('❌ Auto recovery failed:', error);
      toast({
        title: 'แก้ไขปัญหาไม่สำเร็จ',
        description: 'กรุณารีเฟรชหน้าเว็บด้วยตนเอง',
        variant: 'destructive',
        duration: 5000,
      });
    }
  };

  const checkPageLoadPerformance = () => {
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      
      setPerformanceMetrics(prev => ({
        ...prev,
        pageLoadTime: loadTime
      }));

      // หากโหลดนานเกิน 15 วินาที
      if (loadTime > 15000) {
        console.log(`⚠️ Slow page load detected: ${loadTime}ms`);
        performAutoRecovery('Page load timeout exceeded 15 seconds');
      }
    }
  };

  const trackComponentStuck = (componentName: string) => {
    const now = Date.now();
    const lastCheck = loadingStates.get(componentName) || now;
    const timeDiff = now - lastCheck;

    // หาก component ติด loading เกิน 8 วินาที
    if (timeDiff > 8000) {
      console.log(`⚠️ Component stuck detected: ${componentName} (${timeDiff}ms)`);
      
      setPerformanceMetrics(prev => ({
        ...prev,
        componentStuckCount: prev.componentStuckCount + 1
      }));

      performAutoRecovery(`Component ${componentName} stuck for ${timeDiff}ms`);
      loadingStates.delete(componentName);
    } else {
      loadingStates.set(componentName, now);
    }
  };

  const trackNetworkFailure = (endpoint: string) => {
    const now = Date.now();
    const failureCount = (networkFailures.get(endpoint) || 0) + 1;
    networkFailures.set(endpoint, failureCount);

    setPerformanceMetrics(prev => ({
      ...prev,
      networkFailureCount: prev.networkFailureCount + 1
    }));

    // หาก API calls fail ติดต่อกัน 3+ ครั้ง
    if (failureCount >= 3) {
      console.log(`⚠️ Network failure threshold reached: ${endpoint} (${failureCount} failures)`);
      performAutoRecovery(`Network failures on ${endpoint}: ${failureCount} consecutive failures`);
      networkFailures.delete(endpoint);
    }
  };

  const handleUpdate = async () => {
    try {
      console.log('Starting PWA update process...');
      
      // Show loading toast
      toast({
        title: 'กำลังอัปเดต...',
        description: 'กรุณารอสักครู่',
        duration: 2000,
      });
      
      // ไม่ clear auth cache สำหรับ PWA update เพื่อรักษา session
      // แค่ clear cache ที่ไม่เกี่ยวกับ auth
      await clearAuthCache(false);
      
      // Update service worker
      updateServiceWorker(true);
      
      // Force a hard reload after a short delay
      setTimeout(() => {
        console.log('Force reloading application...');
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Error during update process:', error);
      toast({
        title: 'เกิดข้อผิดพลาดในการอัปเดต',
        description: 'กรุณารีเฟรชหน้าเว็บด้วยตนเอง',
        variant: 'destructive',
        duration: 5000,
      });
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: 'เชื่อมต่ออินเทอร์เน็ตแล้ว',
        description: 'กลับมาออนไลน์แล้ว ข้อมูลจะอัปเดตอัตโนมัติ',
        duration: 3000,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: 'ไม่มีการเชื่อมต่ออินเทอร์เน็ต',
        description: 'แอปยังคงใช้งานได้ด้วยข้อมูลที่บันทึกไว้',
        duration: 5000,
        variant: 'destructive',
      });
    };

    // Check for app version changes (simple version check)
    const checkAppVersion = () => {
      const storedVersion = localStorage.getItem('app-version');
      if (storedVersion && storedVersion !== appVersion) {
        console.log('App version changed, but preserving auth session...');
        // ไม่ clear auth cache เมื่อ app version เปลี่ยน เพื่อรักษา session
        // clearAuthCache();
      }
      localStorage.setItem('app-version', appVersion);
    };

    checkAppVersion();
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [appVersion]);

  // Performance Monitoring useEffect
  useEffect(() => {
    // Check page load performance
    if (document.readyState === 'complete') {
      checkPageLoadPerformance();
    } else {
      window.addEventListener('load', checkPageLoadPerformance);
    }

    // ตั้ง interval ตรวจสอบ performance ทุก 5 นาที
    const performanceInterval = setInterval(() => {
      checkPageLoadPerformance();
    }, 5 * 60 * 1000);

    // ตั้ง interval ตรวจสอบ auth loading stuck ทุก 10 วินาที
    const authCheckInterval = setInterval(() => {
      trackComponentStuck('AuthProvider');
    }, 10000);

    return () => {
      window.removeEventListener('load', checkPageLoadPerformance);
      clearInterval(performanceInterval);
      clearInterval(authCheckInterval);
    };
  }, []);

  // Expose tracking functions to global window for components to use
  useEffect(() => {
    (window as any).trackComponentStuck = trackComponentStuck;
    (window as any).trackNetworkFailure = trackNetworkFailure;
    
    return () => {
      delete (window as any).trackComponentStuck;
      delete (window as any).trackNetworkFailure;
    };
  }, []);

  const contextValue: PWAContextValue = {
    isOnline,
    needRefresh,
    offlineReady,
    updateServiceWorker: handleUpdate,
    clearAllCache,
    appVersion,
    performanceMetrics,
  };

  return (
    <PWAContext.Provider value={contextValue}>
      {children}
    </PWAContext.Provider>
  );
};
