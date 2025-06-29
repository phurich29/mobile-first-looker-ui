
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PWAContextValue {
  isOnline: boolean;
  needRefresh: boolean;
  offlineReady: boolean;
  updateServiceWorker: () => void;
  appVersion: string;
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

  const clearAuthCache = async () => {
    try {
      console.log('Clearing authentication cache...');
      
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

  const handleUpdate = async () => {
    try {
      console.log('Starting PWA update process...');
      
      // Show loading toast
      toast({
        title: 'กำลังอัปเดต...',
        description: 'กรุณารอสักครู่',
        duration: 2000,
      });
      
      // Clear authentication cache before update
      await clearAuthCache();
      
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
        console.log('App version changed, clearing cache...');
        clearAuthCache();
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

  const contextValue: PWAContextValue = {
    isOnline,
    needRefresh,
    offlineReady,
    updateServiceWorker: handleUpdate,
    appVersion,
  };

  return (
    <PWAContext.Provider value={contextValue}>
      {children}
    </PWAContext.Provider>
  );
};
