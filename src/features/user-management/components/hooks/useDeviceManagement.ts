
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useDeviceListOptimistic } from "@/features/equipment/hooks/useGlobalDeviceCache";

interface Device {
  device_code: string;
  display_name?: string;
}

export function useDeviceManagement() {
  const [userDevices, setUserDevices] = useState<string[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const { toast } = useToast();
  const cachedDevices = useDeviceListOptimistic();

  // Transform cached devices to expected format
  const availableDevices = cachedDevices.map(device => ({
    device_code: device.device_code,
    display_name: device.display_name
  }));

  const fetchDevices = async (userId: string) => {
    setIsLoadingDevices(true);
    try {
      console.log('Using cached devices from global cache...');

      console.log(`Found ${availableDevices.length} devices from cache:`, availableDevices.map(d => d.device_code));

      // Fetch user's current device access
      const { data: accessData, error: accessError } = await supabase
        .from('user_device_access')
        .select('device_code')
        .eq('user_id', userId);

      if (accessError) throw accessError;

      setUserDevices(accessData?.map(item => item.device_code) || []);
      console.log('User device access:', accessData?.map(item => item.device_code) || []);
    } catch (error) {
      console.error('Error fetching devices:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลอุปกรณ์ได้",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDevices(false);
    }
  };

  const grantDeviceAccess = async (userId: string, deviceCode: string) => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('user_device_access')
        .insert({
          user_id: userId,
          device_code: deviceCode,
          created_by: currentUser.id
        });

      if (error) throw error;

      setUserDevices(prev => [...prev, deviceCode]);
      
      const device = availableDevices.find(d => d.device_code === deviceCode);
      const deviceName = device?.display_name || deviceCode;
      
      toast({
        title: "เพิ่มสิทธิ์สำเร็จ",
        description: `เพิ่มสิทธิ์การเข้าถึงอุปกรณ์ "${deviceName}" เรียบร้อยแล้ว`
      });
    } catch (error) {
      console.error('Error granting device access:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มสิทธิ์การเข้าถึงอุปกรณ์ได้",
        variant: "destructive"
      });
    }
  };

  const revokeDeviceAccess = async (userId: string, deviceCode: string) => {
    try {
      const { error } = await supabase
        .from('user_device_access')
        .delete()
        .eq('user_id', userId)
        .eq('device_code', deviceCode);

      if (error) throw error;

      setUserDevices(prev => prev.filter(code => code !== deviceCode));
      
      const device = availableDevices.find(d => d.device_code === deviceCode);
      const deviceName = device?.display_name || deviceCode;
      
      toast({
        title: "ลบสิทธิ์สำเร็จ",
        description: `ลบสิทธิ์การเข้าถึงอุปกรณ์ "${deviceName}" เรียบร้อยแล้ว`
      });
    } catch (error) {
      console.error('Error revoking device access:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบสิทธิ์การเข้าถึงอุปกرณ์ได้",
        variant: "destructive"
      });
    }
  };

  return {
    availableDevices,
    userDevices,
    isLoadingDevices,
    fetchDevices,
    grantDeviceAccess,
    revokeDeviceAccess
  };
}
