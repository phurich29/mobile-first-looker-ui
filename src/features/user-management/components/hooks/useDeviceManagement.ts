
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Device {
  device_code: string;
  display_name?: string;
}

export function useDeviceManagement() {
  const [availableDevices, setAvailableDevices] = useState<Device[]>([]);
  const [userDevices, setUserDevices] = useState<string[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const { toast } = useToast();

  const fetchDevices = async (userId: string) => {
    setIsLoadingDevices(true);
    try {
      console.log('Fetching devices using same method as Equipment page...');
      
      // Get unique device codes from rice_quality_analysis
      const { data: analysisData, error: analysisError } = await supabase
        .from('rice_quality_analysis')
        .select('device_code, created_at')
        .not('device_code', 'is', null)
        .not('device_code', 'eq', '')
        .order('created_at', { ascending: false });

      if (analysisError) throw analysisError;

      // Process device data to get latest entry for each device
      const deviceMap = new Map<string, { device_code: string; created_at: string }>();
      analysisData?.forEach(item => {
        if (item.device_code && !deviceMap.has(item.device_code)) {
          deviceMap.set(item.device_code, {
            device_code: item.device_code,
            created_at: item.created_at
          });
        }
      });

      const uniqueDeviceCodes = Array.from(deviceMap.keys());
      console.log(`Found ${uniqueDeviceCodes.length} unique devices:`, uniqueDeviceCodes);

      // Get device settings for display names
      const { data: settingsData, error: settingsError } = await supabase
        .from('device_settings')
        .select('device_code, display_name')
        .in('device_code', uniqueDeviceCodes);

      if (settingsError) {
        console.error('Error fetching device settings:', settingsError);
      }

      // Create settings map
      const settingsMap = new Map<string, string>();
      settingsData?.forEach(setting => {
        if (setting.display_name) {
          settingsMap.set(setting.device_code, setting.display_name);
        }
      });

      // Combine device codes with display names
      const deviceList = uniqueDeviceCodes.map(code => ({
        device_code: code,
        display_name: settingsMap.get(code)
      }));

      console.log('Device list with display names:', deviceList);
      setAvailableDevices(deviceList);

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
        description: "ไม่สามารถลบสิทธิ์การเข้าถึงอุปกรณ์ได้",
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
