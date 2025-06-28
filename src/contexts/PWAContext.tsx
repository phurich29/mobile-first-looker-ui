
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { toast } from '@/components/ui/use-toast';

interface PWAContextValue {
  isOnline: boolean;
  needRefresh: boolean;
  offlineReady: boolean;
  updateServiceWorker: () => void;
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
        description: 'คลิกเพื่อรีเฟรชและใช้เวอร์ชันล่าสุด',
        duration: 0, // Don't auto-dismiss
        action: (
          <button
            onClick={() => updateServiceWorker(true)}
            className="bg-emerald-600 text-white px-3 py-1 rounded text-sm hover:bg-emerald-700"
          >
            อัปเดต
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

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const contextValue: PWAContextValue = {
    isOnline,
    needRefresh,
    offlineReady,
    updateServiceWorker: () => updateServiceWorker(true),
  };

  return (
    <PWAContext.Provider value={contextValue}>
      {children}
    </PWAContext.Provider>
  );
};
