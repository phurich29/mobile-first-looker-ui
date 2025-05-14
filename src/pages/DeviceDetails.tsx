
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { MeasurementItem } from "@/components/MeasurementItem";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface MeasurementData {
  id: number;
  symbol: string;
  name: string;
  price: string;
  percentageChange: number;
  iconColor: string;
  updatedAt: Date;
}

export default function DeviceDetails() {
  const { deviceCode } = useParams();
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(false);
  const [measurements, setMeasurements] = useState<MeasurementData[]>([]);
  const { toast } = useToast();

  // ฟังก์ชันสำหรับดึงข้อมูลการวัดผลจากอุปกรณ์ที่เลือก
  const fetchDeviceMeasurements = async () => {
    if (!deviceCode) return;
    
    setIsLoading(true);
    try {
      // ดึงข้อมูลล่าสุดจากเครื่องเลือก
      const { data, error } = await supabase
        .from('rice_quality_analysis')
        .select('*')
        .eq('device_code', deviceCode)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error fetching device measurements:", error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถดึงข้อมูลการวัดผลได้",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const latestMeasurement = data[0];
        
        // แปลงข้อมูลให้อยู่ในรูปแบบที่ใช้กับ MeasurementItem
        const measurementDataList: MeasurementData[] = [];
        
        // รายการ metrics ที่ต้องการแสดง
        const metrics = [
          { key: 'whole_kernels', name: 'เมล็ดสมบูรณ์', color: '#9b87f5' },
          { key: 'head_rice', name: 'ต้นข้าว', color: '#4299e1' },
          { key: 'total_brokens', name: 'ปลายรวม', color: '#38b2ac' },
          { key: 'small_brokens', name: 'ปลายย่อย', color: '#ed8936' },
          { key: 'small_brokens_c1', name: 'ปลาย C1', color: '#ecc94b' },
          { key: 'red_line_rate', name: 'ข้าวเส้นแดง', color: '#e53e3e' },
          { key: 'paddy_rate', name: 'ข้าวเปลือก', color: '#805ad5' },
          { key: 'yellow_rice_rate', name: 'ข้าวเหลือง', color: '#d69e2e' },
          { key: 'black_kernel', name: 'ข้าวดำ', color: '#2d3748' },
          { key: 'whiteness', name: 'ความขาว', color: '#718096' },
          { key: 'process_precision', name: 'ความแม่นยำ', color: '#3182ce' },
        ];
        
        // สร้างข้อมูลสำหรับแต่ละ metric
        metrics.forEach(metric => {
          if (latestMeasurement[metric.key] !== null) {
            // แปลงค่าเป็นเปอร์เซ็นต์และปัดเศษให้เป็น 2 ตำแหน่ง
            const value = latestMeasurement[metric.key];
            const formattedValue = parseFloat(value).toFixed(2);
            
            // สำหรับตัวอย่าง เราอาจจะใช้ค่าเดิมเป็น percentageChange
            // ในอนาคตอาจจะคำนวณการเปลี่ยนแปลงจากค่าก่อนหน้า
            const percentageChange = value > 50 ? 1 : -1; // ตัวอย่างเงื่อนไขอย่างง่าย
            
            measurementDataList.push({
              id: measurementDataList.length,
              symbol: metric.key,
              name: metric.name,
              price: formattedValue,
              percentageChange: percentageChange,
              iconColor: metric.color,
              updatedAt: new Date(latestMeasurement.created_at)
            });
          }
        });
        
        setMeasurements(measurementDataList);
        
        toast({
          title: "สำเร็จ",
          description: `โหลดข้อมูลการวัดผลสำหรับอุปกรณ์ ${deviceCode} สำเร็จ`,
        });
      } else {
        toast({
          title: "ไม่พบข้อมูล",
          description: `ไม่พบข้อมูลการวัดผลสำหรับอุปกรณ์ ${deviceCode}`,
          variant: "destructive",
        });
        setMeasurements([]);
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

  // โหลดข้อมูลเมื่อหน้าถูกโหลดหรือเมื่อ deviceCode เปลี่ยน
  useEffect(() => {
    if (deviceCode) {
      fetchDeviceMeasurements();
    }
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
              รายละเอียดข้อมูลการวัด
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1 border-emerald-200 bg-white hover:bg-emerald-50"
            onClick={fetchDeviceMeasurements} 
            disabled={isLoading}
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="text-xs">รีเฟรช</span>
          </Button>
        </div>
        
        {measurements.length === 0 ? (
          <Card className="bg-white p-6 rounded-xl text-center shadow-sm">
            <p className="text-gray-500 text-sm">
              {isLoading 
                ? "กำลังโหลดข้อมูลการวัด..." 
                : `ไม่พบข้อมูลการวัดสำหรับอุปกรณ์ ${deviceCode}`}
            </p>
          </Card>
        ) : (
          <div className="space-y-3 mt-4">
            {measurements.map((item) => (
              <MeasurementItem
                key={`${item.symbol}-${item.id}`}
                symbol={item.symbol}
                name={item.name}
                price={item.price}
                percentageChange={item.percentageChange}
                iconColor={item.iconColor}
                updatedAt={item.updatedAt}
              />
            ))}
          </div>
        )}
      </main>

      <FooterNav />
    </div>
  );
}
