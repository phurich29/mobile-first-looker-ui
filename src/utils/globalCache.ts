import { toast } from '@/components/ui/use-toast';

// Global cache clearing function that can be called from anywhere
export const clearCacheGlobal = async () => {
  try {
    toast({
      title: 'กำลังเคลียร์แคช...',
      description: 'กรุณารอสักครู่',
      duration: 2000,
    });

    console.log('Starting global cache clear...');

    // บันทึกข้อมูลสำคัญที่ต้องการรักษาไว้
    const selectedDevice = localStorage.getItem('selectedDevice');
    
    // หา auth keys ที่ใช้งานจริง
    const authKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('supabase') || key.includes('auth') || key.includes('sb-'))) {
        authKeys.push({ key, value: localStorage.getItem(key) });
      }
    }

    // Clear all caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      for (const cacheName of cacheNames) {
        await caches.delete(cacheName);
        console.log(`Cleared cache: ${cacheName}`);
      }
    }

    // Clear localStorage (except auth and selectedDevice)
    const keysToKeep = ['selectedDevice', ...authKeys.map(item => item.key)];
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !keysToKeep.includes(key)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Clear sessionStorage
    sessionStorage.clear();

    // คืนค่าข้อมูลที่สำคัญ
    if (selectedDevice) {
      localStorage.setItem('selectedDevice', selectedDevice);
    }
    
    // คืนค่า auth data
    authKeys.forEach(item => {
      if (item.value) {
        localStorage.setItem(item.key, item.value);
      }
    });

    toast({
      title: 'เคลียร์แคชเสร็จสิ้น',
      description: 'ระบบได้รับการอัพเดทแล้ว',
      duration: 3000,
    });

    console.log('Global cache cleared successfully');

    // Reload after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 1000);

  } catch (error) {
    console.error('Error clearing global cache:', error);
    toast({
      title: 'เกิดข้อผิดพลาดในการเคลียร์แคช',
      description: 'กรุณารีเฟรชหน้าเว็บด้วยตนเอง',
      variant: 'destructive',
      duration: 5000,
    });
  }
};

// Make it available globally
declare global {
  interface Window {
    clearCacheGlobal: () => Promise<void>;
  }
}

// Attach to window so it can be called from anywhere
if (typeof window !== 'undefined') {
  window.clearCacheGlobal = clearCacheGlobal;
}