import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const clearCache = async (options: { 
  preserveAuth?: boolean;
  showToast?: boolean;
  reload?: boolean;
} = {}) => {
  const { 
    preserveAuth = true, 
    showToast = true,
    reload = true 
  } = options;

  try {
    if (showToast) {
      toast({
        title: 'กำลังเคลียร์แคช...',
        description: 'กรุณารอสักครู่',
        duration: 2000,
      });
    }

    console.log('Starting cache clear...', { preserveAuth });

    // ตรวจสอบสถานะ session ปัจจุบัน
    const { data: { session } } = await supabase.auth.getSession();
    const isUserLoggedIn = !!session?.user;
    
    // บันทึกข้อมูลสำคัญที่ต้องการรักษาไว้
    const selectedDevice = localStorage.getItem('selectedDevice');
    
    // หา auth keys ที่ใช้งานจริง
    const authKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('supabase') || key.includes('auth') || key.includes('sb-'))) {
        authKeys.push(key);
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

    // Clear localStorage (except auth if preserveAuth is true)
    const keysToKeep = preserveAuth && isUserLoggedIn ? 
      [...authKeys, 'selectedDevice'] : 
      ['selectedDevice'];

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

    if (showToast) {
      toast({
        title: 'เคลียร์แคชเสร็จสิ้น',
        description: 'ระบบได้รับการอัพเดทแล้ว',
        duration: 3000,
      });
    }

    console.log('Cache cleared successfully');

    // Reload if requested
    if (reload) {
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }

  } catch (error) {
    console.error('Error clearing cache:', error);
    if (showToast) {
      toast({
        title: 'เกิดข้อผิดพลาดในการเคลียร์แคช',
        description: 'กรุณารีเฟรชหน้าเว็บด้วยตนเอง',
        variant: 'destructive',
        duration: 5000,
      });
    }
  }
};

// เคลียร์แคชทันที (สำหรับเรียกใช้ทั่วไป)
export const clearCacheNow = () => {
  clearCache({
    preserveAuth: true,
    showToast: true,
    reload: true
  });
};

// เคลียร์แคชแบบเต็มรูปแบบ (รวมทั้ง auth)
export const clearAllCache = () => {
  clearCache({
    preserveAuth: false,
    showToast: true,
    reload: true
  });
};