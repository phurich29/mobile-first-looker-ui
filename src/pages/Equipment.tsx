
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { EquipmentCard } from "@/components/EquipmentCard";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { FooterNav } from "@/components/FooterNav";

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

  // ฟังก์ชันรับจำนวนอุปกรณ์ที่ไม่ซ้ำกันทั้งหมด
  const getUniqueDevicesCount = async () => {
    try {
      // ใช้การคิวรี่โดยตรงแทนการใช้ RPC function
      const { data, error } = await supabase
        .from('rice_quality_analysis')
        .select('device_code')
        .not('device_code', 'is', null);
      
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
    setIsLoading(true);
    try {
      // ดึงข้อมูลจากตาราง rice_quality_analysis ทั้งหมด
      const { data, error } = await supabase
        .from('rice_quality_analysis')
        .select('device_code, created_at')
        .not('device_code', 'is', null) // เลือกเฉพาะอุปกรณ์ที่มี device_code
        .order('device_code', { ascending: true }) // เรียงตามรหัสอุปกรณ์
        .order('created_at', { ascending: false }); // เรียงตามวันที่ล่าสุดก่อน

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
        // ใช้วิธีเดียวกับ getUniqueDevicesCount แต่เก็บข้อมูลทั้งหมดของอุปกรณ์
        const deviceMap = new Map<string, DeviceInfo>();
        
        // จัดเรียงข้อมูลตามรหัสอุปกรณ์ โดยเก็บเฉพาะข้อมูลล่าสุดของแต่ละอุปกรณ์
        for (const item of data) {
          if (item.device_code && !deviceMap.has(item.device_code)) {
            deviceMap.set(item.device_code, {
              device_code: item.device_code,
              updated_at: item.created_at
            });
          }
        }
        
        // แปลง Map เป็นอาเรย์ของอุปกรณ์ที่ไม่ซ้ำกัน
        const uniqueDevices: DeviceInfo[] = Array.from(deviceMap.values());
        
        // ดึงจำนวนอุปกรณ์ทั้งหมดที่ไม่ซ้ำกัน
        const totalCount = await getUniqueDevicesCount();
        
        setDevices(uniqueDevices);
        
        toast({
          title: "สำเร็จ",
          description: `พบ ${uniqueDevices.length} อุปกรณ์จาก ${totalCount} เครื่องในระบบ`,
        });
        
        // ตรวจสอบว่าจำนวนอุปกรณ์ที่ดึงมาตรงกับจำนวนทั้งหมดหรือไม่
        if (uniqueDevices.length !== totalCount) {
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
    fetchDevices();
    getUniqueDevicesCount();
  }, []);

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
              />
            ))}
          </div>
        )}
      </main>

      <FooterNav />
    </div>
  );
}
