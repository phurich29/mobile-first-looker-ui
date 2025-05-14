
import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { EquipmentCard } from "@/components/EquipmentCard";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { FooterNav } from "@/components/FooterNav";
import { useAuth } from "@/components/AuthProvider";
import { useQuery } from "@tanstack/react-query";

interface DeviceInfo {
  device_code: string;
  updated_at: string | null;
}

export default function Equipment() {
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [totalUniqueDevices, setTotalUniqueDevices] = useState<number>(0);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { user, userRoles } = useAuth();
  
  const isAdmin = userRoles.includes('admin') || userRoles.includes('superadmin');

  // Function to fetch device data - now uses direct SQL query instead of RPC
  const fetchDeviceData = useCallback(async () => {
    try {
      if (!user) return [];

      console.log('Fetching devices using direct query...');
      
      // Simplified query to get unique device codes with their latest data
      const { data, error } = await supabase
        .from('rice_quality_analysis')
        .select('device_code, created_at')
        .not('device_code', 'is', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching devices:", error);
        throw error;
      }

      // Process device data to get latest entry for each device
      const deviceMap = new Map<string, DeviceInfo>();
      data?.forEach(item => {
        if (item.device_code && !deviceMap.has(item.device_code)) {
          deviceMap.set(item.device_code, {
            device_code: item.device_code,
            updated_at: item.created_at
          });
        }
      });

      console.log("Fetched devices:", deviceMap.size);
      return Array.from(deviceMap.values());
    } catch (error) {
      console.error("Error in fetchDeviceData:", error);
      throw error;
    }
  }, [user]);

  // Count total unique devices
  const getUniqueDevicesCount = useCallback(async () => {
    try {
      if (!user) return 0;
      
      console.log('Counting unique devices...');
      
      const { data, error } = await supabase
        .from('rice_quality_analysis')
        .select('device_code')
        .not('device_code', 'is', null);
      
      if (error) {
        console.error("Error counting unique devices:", error);
        return 0;
      }
      
      // Use Set to count unique device codes
      const uniqueDeviceCodes = new Set();
      data?.forEach(item => {
        if (item.device_code) {
          uniqueDeviceCodes.add(item.device_code);
        }
      });
      
      const count = uniqueDeviceCodes.size;
      console.log(`Found ${count} unique devices`);
      return count;
    } catch (error) {
      console.error("Unexpected error counting devices:", error);
      return 0;
    }
  }, [user]);

  // Use React Query for improved data fetching
  const { 
    data: deviceData,
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['devices', user?.id],
    queryFn: fetchDeviceData,
    enabled: !!user,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      console.error('Device query error:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลอุปกรณ์ได้",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Update devices state when data changes
  useEffect(() => {
    if (deviceData) {
      setDevices(deviceData);
    }
  }, [deviceData]);

  // Fetch total count on initial load
  useEffect(() => {
    if (user) {
      getUniqueDevicesCount().then(setTotalUniqueDevices);
    }
  }, [user, getUniqueDevicesCount]);

  // Handle refresh
  const handleRefresh = async () => {
    try {
      await refetch();
      const count = await getUniqueDevicesCount();
      setTotalUniqueDevices(count);
      
      toast({
        title: "อัพเดทข้อมูลสำเร็จ",
        description: `พบ ${devices.length} อุปกรณ์ที่คุณมีสิทธิ์เข้าถึง`,
      });
    } catch (error) {
      console.error("Refresh error:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัพเดทข้อมูลได้",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64">
      <Header />
      <main className="flex-1 p-4 pb-32 md:pb-16 md:mx-auto md:max-w-5xl md:px-8 w-full">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>อุปกรณ์</h1>
            {totalUniqueDevices > 0 && (
              <p className="text-xs text-gray-500 mt-1">จำนวนอุปกรณ์ทั้งหมดในระบบ: {totalUniqueDevices} เครื่อง</p>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1 border-emerald-200 bg-white hover:bg-emerald-50"
            onClick={handleRefresh} 
            disabled={isLoading}
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="text-xs">รีเฟรช</span>
          </Button>
        </div>
        
        {devices.length === 0 ? (
          <div className="bg-white p-6 rounded-xl text-center shadow-sm">
            <p className="text-gray-500 text-sm">
              {isLoading ? "กำลังดึงข้อมูลอุปกรณ์..." : "ไม่พบอุปกรณ์ กรุณากดปุ่มรีเฟรชเพื่อค้นหาอุปกรณ์"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mt-4 md:grid-cols-3 lg:grid-cols-4">
            {devices.map((device) => (
              <EquipmentCard
                key={device.device_code}
                deviceCode={device.device_code}
                lastUpdated={device.updated_at}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </main>

      <FooterNav />
    </div>
  );
}
