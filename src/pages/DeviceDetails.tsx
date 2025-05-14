
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { MeasurementItem } from "@/components/MeasurementItem";
import { Measurement, ALL_MEASUREMENTS } from "@/components/equipment/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { ResponsiveTable } from "@/components/ui/responsive-table";

// Tab types
type TabValue = "latest" | "history";

export default function DeviceDetails() {
  const { deviceCode } = useParams<{ deviceCode: string }>();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [tabView, setTabView] = useState<TabValue>("latest");
  const [latestMeasurement, setLatestMeasurement] = useState<Measurement | null>(null);
  const [historyData, setHistoryData] = useState<Measurement[]>([]);
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

  // Fetch measurement data
  useEffect(() => {
    if (!deviceCode || !user) return;
    
    setIsLoading(true);
    
    const fetchMeasurementData = async () => {
      try {
        // Query for latest measurement
        let { data: latestData, error: latestError } = await supabase
          .from('rice_quality_analysis')
          .select('*')
          .eq('device_code', deviceCode)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (latestError) {
          console.error("Error fetching latest measurement:", latestError);
        } else if (latestData) {
          setLatestMeasurement(latestData);
        }
        
        // Query for history
        let { data: historyData, error: historyError } = await supabase
          .from('rice_quality_analysis')
          .select('*')
          .eq('device_code', deviceCode)
          .order('created_at', { ascending: false })
          .limit(20);
          
        if (historyError) {
          console.error("Error fetching measurement history:", historyError);
          toast({
            title: "เกิดข้อผิดพลาด",
            description: "ไม่สามารถโหลดข้อมูลการวัดได้",
            variant: "destructive",
          });
        } else if (historyData) {
          setHistoryData(historyData);
        }
        
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
  }, [deviceCode, user, toast]);

  // Handle click on measurement item
  const handleMeasurementClick = (measurementKey: string) => {
    navigate(`/device/${deviceCode}/measurement/${measurementKey}`);
  };

  // Format date for display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    
    return new Date(dateString).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            อุปกรณ์: {deviceInfo?.display_name || deviceCode}
          </h1>
        </div>
        
        {/* Device info card */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="flex-1">
                <h3 className="font-semibold">{deviceInfo?.display_name || deviceCode}</h3>
                <p className="text-xs text-gray-500">
                  {deviceInfo?.location || "ไม่ระบุตำแหน่ง"}
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-xs text-gray-500">อัพเดทล่าสุด</p>
                <p className="text-sm font-medium">
                  {latestMeasurement ? formatDate(latestMeasurement.created_at) : "ไม่มีข้อมูล"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Latest and History */}
        <Card className="mb-4">
          <CardHeader className="p-0 border-b">
            <Tabs
              defaultValue="latest"
              value={tabView}
              onValueChange={(value) => setTabView(value as TabValue)}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 w-full rounded-none">
                <TabsTrigger value="latest">ค่าล่าสุด</TabsTrigger>
                <TabsTrigger value="history">ประวัติการวัด</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          
          <CardContent className="p-0">
            <TabsContent value="latest" className="m-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                </div>
              ) : !latestMeasurement ? (
                <div className="flex justify-center items-center h-32">
                  <p className="text-gray-500">ไม่มีข้อมูลการวัดล่าสุด</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 divide-y">
                  {ALL_MEASUREMENTS.map((measurementInfo) => {
                    const value = latestMeasurement[measurementInfo.key as keyof Measurement];
                    
                    // ข้ามค่าที่ไม่มีข้อมูล
                    if (value === undefined || value === null) return null;
                    
                    return (
                      <div key={measurementInfo.key} onClick={() => handleMeasurementClick(measurementInfo.key)}>
                        <MeasurementItem
                          symbol={measurementInfo.key}
                          name={measurementInfo.name}
                          price={value.toString()}
                          percentageChange={0} // ไม่มีข้อมูลการเปลี่ยนแปลง
                          iconColor={measurementInfo.iconColor}
                          updatedAt={latestMeasurement.created_at ? new Date(latestMeasurement.created_at) : undefined}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="history" className="m-0">
              <ResponsiveTable>
                <TableHeader>
                  <TableRow>
                    <TableHead>เวลา</TableHead>
                    <TableHead>ต้นข้าว (%)</TableHead>
                    <TableHead>ปลายข้าว (%)</TableHead>
                    <TableHead>เมล็ดเสีย (%)</TableHead>
                    <TableHead className="text-right">ดูเพิ่มเติม</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyData.length > 0 ? (
                    historyData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {formatDate(item.created_at)}
                        </TableCell>
                        <TableCell>{item.head_rice ?? '-'}</TableCell>
                        <TableCell>{item.total_brokens ?? '-'}</TableCell>
                        <TableCell>{item.imperfection_rate ?? '-'}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/device/${deviceCode}/detail/${item.id}`)}
                          >
                            ดูข้อมูล
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        {isLoading ? 
                          "กำลังโหลดข้อมูล..." : 
                          "ไม่พบประวัติการวัด"
                        }
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </ResponsiveTable>
            </TabsContent>
          </CardContent>
        </Card>
      </main>

      <FooterNav />
    </div>
  );
}
