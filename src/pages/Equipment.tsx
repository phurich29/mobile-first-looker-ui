
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { EquipmentCard } from "@/components/EquipmentCard";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DeviceInfo {
  device_code: string;
  updated_at: string | null;
}

export default function Equipment() {
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Function to fetch devices from Supabase
  const fetchDevices = async () => {
    setIsLoading(true);
    try {
      // Query the device_settings table to get all device codes
      const { data, error } = await supabase
        .from("device_settings")
        .select("device_code, updated_at")
        .order("updated_at", { ascending: false });

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
        setDevices(data);
        toast({
          title: "สำเร็จ",
          description: `พบ ${data.length} อุปกรณ์`,
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
      <main className="flex-1 p-4 pb-28">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">อุปกรณ์</h1>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2 border-emerald-200 bg-white hover:bg-emerald-50"
            onClick={fetchDevices} 
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>รีเฟรช</span>
          </Button>
        </div>
        
        {devices.length === 0 ? (
          <div className="bg-white p-8 rounded-xl text-center shadow-sm">
            <p className="text-gray-500">
              {isLoading ? "กำลังดึงข้อมูลอุปกรณ์..." : "ไม่พบอุปกรณ์ กรุณากดปุ่มรีเฟรชเพื่อค้นหาอุปกรณ์"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
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

      {/* Navigation bar */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-100 flex justify-around py-4 shadow-xl rounded-t-3xl backdrop-blur-sm bg-white/90" style={{ maxHeight: '80px' }}>
        <a href="/" className="flex flex-col items-center">
          <div className="w-6 h-1 bg-gray-300 rounded-full mx-auto mb-1"></div>
          <span className="text-xs text-gray-400">Home</span>
        </a>
        <a href="/market" className="flex flex-col items-center">
          <div className="w-6 h-1 bg-gray-300 rounded-full mx-auto mb-1"></div>
          <span className="text-xs text-gray-400">Market</span>
        </a>
        <a href="/measurements" className="flex flex-col items-center">
          <div className="w-6 h-1 bg-gray-300 rounded-full mx-auto mb-1"></div>
          <span className="text-xs text-gray-400">รายการวัด</span>
        </a>
        <a href="/profile" className="flex flex-col items-center">
          <div className="w-6 h-1 bg-gray-300 rounded-full mx-auto mb-1"></div>
          <span className="text-xs text-gray-400">Profile</span>
        </a>
      </nav>
    </div>
  );
}
