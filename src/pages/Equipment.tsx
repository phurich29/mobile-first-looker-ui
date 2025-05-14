import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { EquipmentCard } from "@/components/EquipmentCard";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { FooterNav } from "@/components/FooterNav";
import { useAuth } from "@/components/AuthProvider";

interface DeviceInfo {
  device_code: string;
  updated_at: string | null;
}

export default function Equipment() {
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [totalUniqueDevices, setTotalUniqueDevices] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { user, userRoles } = useAuth();
  
  const isAdmin = userRoles.includes('admin') || userRoles.includes('superadmin');
  
  // ฟังก์ชันรับจำนวนอุปกรณ์ที่ไม่ซ้ำกันทั้งหมด
  const getUniqueDevicesCount = async () => {
    try {
      if (!user) return 0;
      
      // ใช้การคิวรี่โดยตรงแทนการใช้ RPC function
      let query = supabase
        .from('rice_quality_analysis')
        .select('device_code')
        .not('device_code', 'is', null);
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error counting unique devices:", error);
        return 0;
      }
      
      // ใช้ Set เพื่อนับ device_code ที่ไม่ซ้ำกัน
      const uniqueDeviceCodes = new Set();
      data?.forEach(item => {
        if (item.device_code) {
          uniqueDeviceCodes.add(item.device_code);
        }
      });
      
      const count = uniqueDeviceCodes.size;
      setTotalUniqueDevices(count);
      return count;
    } catch (error) {
      console.error("Unexpected error counting devices:", error);
      return 0;
    }
  };

  // ฟังก์ชันดึงข้อมูลอุปกรณ์ทั้งหมดที่ไม่ซ้ำกัน
  const fetchDevices = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // For admins and superadmins, we fetch all devices
      // For regular users, RLS will automatically filter devices they have access to
      const { data, error } = await supabase
        .from('rice_quality_analysis')
        .select('device_code, thai_datetime')
        .not('device_code', 'is', null)
        .order('device_code', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching devices:", error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถดึงข้อมูลอุปกรณ์ได้",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (data) {
        const deviceMap = new Map<string, DeviceInfo>();
        
        for (const item of data) {
          if (item.device_code && !deviceMap.has(item.device_code)) {
            deviceMap.set(item.device_code, {
              device_code: item.device_code,
              updated_at: item.thai_datetime
            });
          }
        }
        
        const uniqueDevices: DeviceInfo[] = Array.from(deviceMap.values());
        
        const totalCount = await getUniqueDevicesCount();
        
        setDevices(uniqueDevices);
        
        toast({
          title: "สำเร็จ",
          description: `พบ ${uniqueDevices.length} อุปกรณ์ที่คุณมีสิทธิ์เข้าถึงจาก ${totalCount} เครื่องในระบบ`,
        });
        
        if (isAdmin && uniqueDevices.length !== totalCount) {
          console.warn(`จำนวนอุปกรณ์ที่ดึงมา (${uniqueDevices.length}) ไม่ตรงกับจำนวนทั้งหมด (${totalCount})`); 
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "มีข้อผิดพลาดไม่คาดคิดเกิดขึ้น",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch devices and count on initial load
  useEffect(() => {
    if (user) {
      fetchDevices();
      getUniqueDevicesCount();
    }
  }, [user]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64">
      <Header />
      <main className="flex-1 p-4 pb-32">
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
            onClick={fetchDevices} 
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
          <div className="grid grid-cols-2 gap-3 mt-4">
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
