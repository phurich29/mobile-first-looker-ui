import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowLeft, ChartLine } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { ALL_MEASUREMENTS } from "@/components/equipment/types";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { ResponsiveTable } from "@/components/ui/responsive-table";

// Timeframe options
type TimeFrame = "1hour" | "24hours" | "7days" | "30days";

export default function MeasurementDetail() {
  const { deviceCode, measurementKey } = useParams<{ deviceCode: string, measurementKey: string }>();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("1hour");
  const [measurementData, setMeasurementData] = useState<any[]>([]);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  // Find measurement info from the list
  const measurementInfo = ALL_MEASUREMENTS.find(m => m.key === measurementKey);

  // Fetch device info
  useEffect(() => {
    if (!deviceCode || !user) return;
    
    const fetchDeviceInfo = async () => {
      try {
        const { data, error } = await supabase
          .from('device_settings')
          .select('*')
          .eq('device_code', deviceCode)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setDeviceInfo(data);
        }
      } catch (error) {
        console.error("Error fetching device info:", error);
      }
    };
    
    fetchDeviceInfo();
  }, [deviceCode, user]);

  // Fetch measurement data based on selected timeframe
  useEffect(() => {
    if (!deviceCode || !measurementKey || !user) return;
    
    setIsLoading(true);
    
    const fetchMeasurementData = async () => {
      try {
        // Calculate the date range based on the selected timeframe
        const now = new Date();
        let startDate = new Date();
        
        switch(timeFrame) {
          case "1hour":
            startDate.setHours(now.getHours() - 1);
            break;
          case "24hours":
            startDate.setDate(now.getDate() - 1);
            break;
          case "7days":
            startDate.setDate(now.getDate() - 7);
            break;
          case "30days":
            startDate.setDate(now.getDate() - 30);
            break;
        }
        
        // Format dates for the query
        const startDateStr = startDate.toISOString();
        const endDateStr = now.toISOString();
        
        // Query data for the chart
        let { data: chartData, error: chartError } = await supabase
          .from('rice_quality_analysis')
          .select('*')
          .eq('device_code', deviceCode)
          .not(measurementKey, 'is', null)
          .gte('created_at', startDateStr)
          .lte('created_at', endDateStr)
          .order('created_at', { ascending: false });
          
        if (chartError) throw chartError;
        
        if (chartData) {
          // Process data for chart display
          const processedData = chartData.map(item => ({
            ...item,
            time: new Date(item.created_at).toLocaleTimeString(),
            date: new Date(item.created_at).toLocaleDateString(),
          }));
          
          setMeasurementData(processedData);
        }
        
        // Query for history table (limit to most recent entries)
        let { data: historyData, error: historyError } = await supabase
          .from('rice_quality_analysis')
          .select('*')
          .eq('device_code', deviceCode)
          .not(measurementKey, 'is', null)
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (historyError) throw historyError;
        
        if (historyData) {
          setHistoryData(historyData);
        }
        
        toast({
          title: "โหลดข้อมูลสำเร็จ",
          description: `แสดงข้อมูล ${measurementInfo?.name || measurementKey} ของอุปกรณ์ ${deviceCode}`,
        });
        
      } catch (error) {
        console.error("Error fetching measurement data:", error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลการวัดได้",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMeasurementData();
  }, [deviceCode, measurementKey, timeFrame, user, toast, measurementInfo]);

  // Get the color for the chart line from measurement info
  const getChartColor = () => {
    return measurementInfo?.iconColor || "#9b87f5";
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64">
      <Header />
      
      <main className="flex-1 p-4 pb-32">
        {/* Section 1: Menubar with back button and device code */}
        <div className="flex items-center gap-2 mb-4">
          <Link 
            to={`/device/${deviceCode}`} 
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm hover:bg-gray-50"
          >
            <ArrowLeft size={18} />
          </Link>
          
          <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>
            {measurementInfo?.name || measurementKey}
          </h1>
        </div>
        
        {/* Section 2: Device info and timeframe selection */}
        <div className="grid grid-cols-1 gap-4 mb-4">
          <Card className="overflow-hidden">
            <CardHeader className="p-4 bg-white border-b">
              {/* Timeframe selection tabs */}
              <Tabs
                value={timeFrame}
                onValueChange={(value) => setTimeFrame(value as TimeFrame)}
                className="w-full"
              >
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="1hour">1 ชม.</TabsTrigger>
                  <TabsTrigger value="24hours">24 ชม.</TabsTrigger>
                  <TabsTrigger value="7days">7 วัน</TabsTrigger>
                  <TabsTrigger value="30days">30 วัน</TabsTrigger>
                </TabsList>
                
                <TabsContent value="1hour" className="hidden">
                  {/* We're using tabs for state, not for displaying content */}
                </TabsContent>
                <TabsContent value="24hours" className="hidden">
                  {/* We're using tabs for state, not for displaying content */}
                </TabsContent>
                <TabsContent value="7days" className="hidden">
                  {/* We're using tabs for state, not for displaying content */}
                </TabsContent>
                <TabsContent value="30days" className="hidden">
                  {/* We're using tabs for state, not for displaying content */}
                </TabsContent>
              </Tabs>
            </CardHeader>
            
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Device icon/logo */}
                <div 
                  className="flex items-center justify-center w-12 h-12 rounded-full"
                  style={{ backgroundColor: `${getChartColor()}20` }}
                >
                  <ChartLine size={24} style={{ color: getChartColor() }} />
                </div>
                
                {/* Device information */}
                <div>
                  <h3 className="font-semibold">{deviceInfo?.display_name || deviceCode}</h3>
                  <p className="text-xs text-gray-500">
                    {deviceInfo?.location || "ไม่ระบุตำแหน่ง"}
                  </p>
                </div>
                
                {/* Latest value */}
                <div className="ml-auto text-right">
                  <p className="text-xl font-bold">
                    {measurementData[0]?.[measurementKey] || "-"}
                  </p>
                  <p className="text-xs text-gray-500">
                    ค่าล่าสุด
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Section 3: Chart */}
        <div className="grid grid-cols-1 gap-4 mb-4">
          <Card>
            <CardContent className="p-4 pt-6">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                </div>
              ) : measurementData.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                  <p className="text-gray-500">ไม่มีข้อมูลในช่วงเวลาที่เลือก</p>
                </div>
              ) : (
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={measurementData}
                      margin={{ top: 5, right: 10, left: 10, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey={timeFrame === "30days" || timeFrame === "7days" ? "date" : "time"} 
                        tick={{ fontSize: 10 }}
                        tickFormatter={(value) => {
                          // Format based on timeframe
                          if (timeFrame === "1hour" || timeFrame === "24hours") {
                            return value.split(":").slice(0, 2).join(":");
                          }
                          return value;
                        }}
                      />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey={measurementKey} 
                        name={measurementInfo?.name || measurementKey} 
                        stroke={getChartColor()} 
                        activeDot={{ r: 8 }} 
                        strokeWidth={2}
                        dot={{ strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Section 4: History table */}
        <Card>
          <CardHeader className="p-4 border-b">
            <h2 className="font-semibold">ประวัติการวัด</h2>
          </CardHeader>
          
          <CardContent className="p-0">
            <ResponsiveTable>
              <TableHeader>
                <TableRow>
                  <TableHead>เวลา</TableHead>
                  <TableHead>{measurementInfo?.name || measurementKey}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyData.length > 0 ? (
                  historyData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {new Date(item.created_at).toLocaleString('th-TH', {
                          day: 'numeric',
                          month: 'numeric',
                          year: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>{item[measurementKey] || '-'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-4">
                      {isLoading ? 
                        "กำลังโหลดข้อมูล..." : 
                        "ไม่พบประวัติการวัด"
                      }
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </ResponsiveTable>
          </CardContent>
        </Card>
      </main>

      <FooterNav />
    </div>
  );
}
