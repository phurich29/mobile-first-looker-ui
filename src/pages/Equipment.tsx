
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
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Function to fetch devices from Supabase
  const fetchDevices = async () => {
    setIsLoading(true);
    try {
      // Query the rice_quality_analysis table to get all unique device codes
      const { data, error } = await supabase
        .from("rice_quality_analysis")
        .select("device_code, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching devices:", error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถดึงข้อมูลอุปกรณ์ได้",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        // Get unique device codes with their latest timestamps
        const uniqueDevices = data.reduce((acc: DeviceInfo[], item) => {
          if (item.device_code && !acc.some(device => device.device_code === item.device_code)) {
            acc.push({
              device_code: item.device_code,
              updated_at: item.created_at
            });
          }
          return acc;
        }, []);

        setDevices(uniqueDevices);
        toast({
          title: "สำเร็จ",
          description: `พบ ${uniqueDevices.length} อุปกรณ์`,
        });
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

  // Fetch devices on initial load
  useEffect(() => {
    fetchDevices();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64">
      <Header />
      <main className="flex-1 p-4 pb-32">
        <div className="flex justify-between items-center mb-4">
          <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>อุปกรณ์</h1>
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
