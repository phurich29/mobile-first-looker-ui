
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowLeft, ChartLine, History } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
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

// Timeframe options
type TimeFrame = "1hour" | "24hours" | "7days" | "30days";

export default function DeviceDetails() {
  const { deviceCode } = useParams<{ deviceCode: string }>();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("1hour");
  const [measurementData, setMeasurementData] = useState<any[]>([]);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

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
    if (!deviceCode || !user) return;
    
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
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (historyError) throw historyError;
        
        if (historyData) {
          setHistoryData(historyData);
        }
        
        toast({
          title: "โหลดข้อมูลสำเร็จ",
          description: `แสดงข้อมูลของอุปกรณ์ ${deviceCode}`,
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
  }, [deviceCode, timeFrame, user, toast]);

  // Get the color for the chart line from device settings or use default
  const getChartColor = () => {
    return deviceInfo?.graph_color || "#9b87f5";
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64">
      <Header />
      
      <main className="flex-1 p-4 pb-32">
        {/* Section 1: Menubar with back button and device code */}
        <div className="flex items-center gap-2 mb-4">
          <Link 
            to="/equipment" 
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm hover:bg-gray-50"
          >
            <ArrowLeft size={18} />
          </Link>
          
          <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>
            อุปกรณ์: {deviceCode}
          </h1>
        </div>
        
        {/* Section 2: Timeframe selection and device info card */}
        <div className="grid grid-cols-1 gap-4 mb-4">
          <Card className="overflow-hidden">
            <CardHeader className="p-4 bg-white border-b">
              {/* Timeframe selection tabs */}
              <Tabs
                defaultValue="1hour"
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
              </Tabs>
            </CardHeader>
            
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Device icon/logo */}
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full">
                  <ChartLine size={24} className="text-orange-500" />
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
                    {measurementData[0]?.head_rice || "-"}
                  </p>
                  <p className="text-xs text-green-500">
                    {measurementData[0] && "+0.5%"}
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
                        dataKey="head_rice" 
                        name="ต้นข้าว" 
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
          <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <History size={18} />
              <h2 className="font-semibold">ประวัติการวัด</h2>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <ResponsiveTable>
              <TableHeader>
                <TableRow>
                  <TableHead>เวลา</TableHead>
                  <TableHead>ต้นข้าว (%)</TableHead>
                  <TableHead>ปลายข้าว (%)</TableHead>
                  <TableHead>เมล็ดเสีย (%)</TableHead>
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
                      <TableCell>{item.head_rice || '-'}</TableCell>
                      <TableCell>{item.total_brokens || '-'}</TableCell>
                      <TableCell>{item.imperfection_rate || '-'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
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
