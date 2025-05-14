
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatThaiDate } from "@/utils/dateFormatters";

export default function DeviceDetails() {
  const { deviceCode } = useParams();
  const isMobile = useIsMobile();
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const { toast } = useToast();

  // Format the Thai datetime to display in a standard format
  const formattedTime = formatThaiDate(lastUpdated);

  // Fetch device details on component mount
  useEffect(() => {
    const fetchDeviceData = async () => {
      if (!deviceCode) return;
      
      try {
        const { data, error } = await supabase
          .from('rice_quality_analysis')
          .select('thai_datetime')
          .eq('device_code', deviceCode)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (error) {
          console.error("Error fetching device data:", error);
          return;
        }
        
        if (data && data.length > 0) {
          setLastUpdated(data[0].thai_datetime);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      }
    };
    
    fetchDeviceData();
  }, [deviceCode]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64">
      <Header />
      <main className="flex-1 p-4 pb-32">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>
              อุปกรณ์: {deviceCode}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              อัพเดทล่าสุด: {formattedTime}
            </p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl text-center shadow-sm">
          <p className="text-gray-500 text-sm">
            ข้อมูลการวัดจะแสดงที่นี่
          </p>
        </div>
      </main>

      <FooterNav />
    </div>
  );
}
