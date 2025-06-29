
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DeviceList } from "./DeviceList";

interface Device {
  device_code: string;
}

interface User {
  id: string;
  email: string;
}

export const AccessMapping = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [deviceUserMap, setDeviceUserMap] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { user, userRoles } = useAuth();
  const { toast } = useToast();
  
  const isSuperAdmin = userRoles.includes('superadmin');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all devices using the same method as Equipment page
      const { data: devicesData, error: devicesError } = await supabase.rpc('get_devices_with_details', {
        user_id_param: user?.id,
        is_admin_param: true,
        is_superadmin_param: isSuperAdmin
      });

      if (devicesError) throw devicesError;

      // Transform to match Device interface
      const devicesList = (devicesData || []).map(device => ({
        device_code: device.device_code
      }));

      setDevices(devicesList);

      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, email')
        .order('email');

      if (usersError) throw usersError;
      setUsers(usersData || []);

      // Fetch device-user mappings
      const { data: accessData, error: accessError } = await supabase
        .from('user_device_access')
        .select('user_id, device_code');

      if (accessError) throw accessError;

      // Create device-user mapping
      const deviceMap: Record<string, string[]> = {};
      (accessData || []).forEach(access => {
        if (!deviceMap[access.device_code]) {
          deviceMap[access.device_code] = [];
        }
        deviceMap[access.device_code].push(access.user_id);
      });

      setDeviceUserMap(deviceMap);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && isSuperAdmin) {
      fetchData();
    }
  }, [user, isSuperAdmin]);

  const handleSelectDevice = (deviceCode: string) => {
    // Handle device selection logic here
    console.log('Selected device:', deviceCode);
  };

  if (!isSuperAdmin) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DeviceList 
        devices={devices}
        deviceUserMap={deviceUserMap}
        isLoading={isLoading}
        onRefresh={fetchData}
        onSelectDevice={handleSelectDevice}
      />
    </div>
  );
};
