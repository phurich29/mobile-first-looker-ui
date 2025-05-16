
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { SelectedGraph } from "./types";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Wheat, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/AuthProvider";
import { REQUIRED_DEVICE_CODES } from "@/features/equipment/services/deviceDataService";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";

interface GraphSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectGraph: (graph: SelectedGraph) => void;
}

// Define the type for the measurement data
interface MeasurementData {
  symbol: string;
  name: string;
  icon?: React.ReactNode;
  value?: any; // Added value property to match what we're using
}

interface DeviceInfo {
  device_code: string;
  device_name: string;
  last_updated?: Date | null;
}

export const GraphSelector = ({ open, onOpenChange, onSelectGraph }: GraphSelectorProps) => {
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [measurements, setMeasurements] = useState<MeasurementData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, userRoles } = useAuth();
  
  const isAdmin = userRoles.includes('admin') || userRoles.includes('superadmin');
  const isSuperAdmin = userRoles.includes('superadmin');

  useEffect(() => {
    if (open) {
      fetchDevices();
    }
  }, [open]);

  useEffect(() => {
    if (selectedDevice) {
      fetchMeasurements(selectedDevice);
    } else {
      setMeasurements([]);
    }
  }, [selectedDevice]);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      if (!user) {
        setDevices([]);
        setLoading(false);
        return;
      }
      
      let deviceResults: { device_code: string }[] = [];
      
      // Use the same logic as in useDeviceData.ts
      if (isSuperAdmin) {
        // For superadmin, start with required devices
        const requiredDeviceObjects = REQUIRED_DEVICE_CODES.map(deviceCode => ({
          device_code: deviceCode,
        }));
        
        deviceResults = requiredDeviceObjects;
      } else {
        // For regular users or admins
        // Get devices that user has access to
        const { data: userDevices, error: userDevicesError } = await supabase
          .from('user_device_access')
          .select('device_code')
          .eq('user_id', user.id);

        if (userDevicesError) {
          console.error("Error fetching user device access:", userDevicesError);
          setDevices([]);
          setLoading(false);
          return;
        }

        // Create a set of authorized device codes
        const authorizedDeviceCodes = new Set<string>();
        
        // Add user's authorized devices
        userDevices?.forEach(d => {
          if (d.device_code) {
            authorizedDeviceCodes.add(d.device_code);
          }
        });
        
        // If user is admin, also add required devices
        if (isAdmin) {
          REQUIRED_DEVICE_CODES.forEach(code => {
            authorizedDeviceCodes.add(code);
          });
        }
        
        deviceResults = Array.from(authorizedDeviceCodes).map(code => ({
          device_code: code
        }));
      }
      
      // Get last update time for each device and format with device name
      const devicePromises = deviceResults.map(async (device) => {
        const { data: latestData, error } = await supabase
          .from('rice_quality_analysis')
          .select('created_at')
          .eq('device_code', device.device_code)
          .order('created_at', { ascending: false })
          .limit(1);
        
        const lastUpdated = latestData && latestData.length > 0 
          ? new Date(latestData[0].created_at) 
          : null;
        
        return {
          device_code: device.device_code,
          device_name: `อุปกรณ์วัด ${device.device_code}`,
          last_updated: lastUpdated
        };
      });
      
      const formattedDevices = await Promise.all(devicePromises);
      setDevices(formattedDevices);
    } catch (error) {
      console.error("Error fetching devices:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIconColor = (symbol: string) => {
    // Return different colors based on measurement type
    if (symbol === "class1") return "#F7931A"; // amber/orange
    if (symbol === "class2") return "#627EEA"; // blue
    if (symbol === "class3") return "#F3BA2F"; // yellow
    if (symbol === "short_grain") return "#333333"; // dark gray
    if (symbol === "slender_kernel") return "#4B9CD3"; // light blue
    
    // Colors for ingredients
    if (symbol === "whole_kernels") return "#4CAF50"; // green
    if (symbol === "head_rice") return "#2196F3"; // blue
    if (symbol === "total_brokens") return "#FF9800"; // orange
    if (symbol === "small_brokens") return "#9C27B0"; // purple
    if (symbol === "small_brokens_c1") return "#795548"; // brown
    
    // Colors for impurities
    if (symbol.includes("red")) return "#9b87f5"; // purple
    if (symbol.includes("white")) return "#EEEEEE"; // light gray
    if (symbol.includes("yellow")) return "#FFEB3B"; // yellow
    if (symbol.includes("black")) return "#212121"; // almost black
    
    // Hash-based color selection for other measurements
    const hash = symbol.split("").reduce((sum, char, i) => {
      return sum + char.charCodeAt(0) * (i + 1);
    }, 0);
    
    const colors = [
      "#F7931A", "#627EEA", "#F3BA2F", "#E84142", 
      "#26A17B", "#2775CA", "#345D9D", "#2DABE8",
      "#FF9900", "#6F41D8", "#0052FF", "#E50914"
    ];
    
    return colors[hash % colors.length];
  };

  const getIconForMeasurement = (symbol: string) => {
    return <Wheat className="h-5 w-5 text-white" />;
  };

  const fetchMeasurements = async (deviceCode: string) => {
    setLoading(true);
    try {
      // Get latest data for this device
      const { data, error } = await supabase
        .from('rice_quality_analysis')
        .select('*')  // Select all columns instead of specific measurements
        .eq('device_code', deviceCode)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error fetching measurements:", error);
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        setError("ไม่พบข้อมูล");
        setData([]);
        return;
      }

      // Transform the data for the chart, accessing the specific column directly
      const measurementsData = Object.entries(data[0])
        .filter(([key]) => !['id', 'created_at', 'updated_at', 'device_code', 'thai_datetime'].includes(key))
        .map(([key, value]) => {
          // Format the name to be more user-friendly
          const formattedName = key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
            
          return {
            symbol: key,
            name: formattedName,
            value: value // Store the actual value from the data
          };
        });
      
      setMeasurements(measurementsData);
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDevices = devices.filter(device => 
    device.device_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.device_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMeasurements = measurements.filter(measurement => 
    measurement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    measurement.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectMeasurement = (symbol: string, name: string) => {
    if (selectedDevice) {
      const selectedDeviceName = devices.find(d => d.device_code === selectedDevice)?.device_name || selectedDevice;
      
      onSelectGraph({
        deviceCode: selectedDevice,
        deviceName: selectedDeviceName,
        symbol,
        name
      });
    }
  };

  // Format Thai name from symbol
  const getThaiName = (symbol: string, name: string) => {
    // For class measurement types
    if (symbol === "class1") return "ชั้น 1 (>7.0mm)";
    if (symbol === "class2") return "ชั้น 2 (>6.6-7.0mm)";
    if (symbol === "class3") return "ชั้น 3 (>6.2-6.6mm)";
    if (symbol === "short_grain") return "เมล็ดสั้น";
    if (symbol === "slender_kernel") return "ข้าวลีบ";
    
    // For ingredient measurement types
    if (symbol === "whole_kernels") return "เต็มเมล็ด";
    if (symbol === "head_rice") return "ต้นข้าว";
    if (symbol === "total_brokens") return "ข้าวหักรวม";
    if (symbol === "small_brokens") return "ปลายข้าว";
    if (symbol === "small_brokens_c1") return "ปลายข้าว C1";
    
    // For impurities measurement types
    if (symbol === "red_line_rate") return "สีต่ำกว่ามาตรฐาน";
    if (symbol === "parboiled_red_line") return "เมล็ดแดง";
    if (symbol === "parboiled_white_rice") return "ข้าวดิบ";
    if (symbol === "honey_rice") return "เมล็ดม่วง";
    if (symbol === "yellow_rice_rate") return "เมล็ดเหลือง";
    if (symbol === "black_kernel") return "เมล็ดดำ";
    if (symbol === "partly_black_peck") return "ดำบางส่วน & จุดดำ";
    if (symbol === "partly_black") return "ดำบางส่วน";
    if (symbol === "imperfection_rate") return "เมล็ดเสีย";
    if (symbol === "sticky_rice_rate") return "ข้าวเหนียว";
    if (symbol === "impurity_num") return "เมล็ดอื่นๆ";
    if (symbol === "paddy_rate") return "ข้าวเปลือก(เมล็ด/กก.)";
    if (symbol === "whiteness") return "ความขาว";
    if (symbol === "process_precision") return "ระดับขัดสี";
    
    // Default to the formatted name if no specific Thai name is available
    return name;
  };
  
  // Format the last updated time
  const formatLastUpdated = (date: Date | null | undefined) => {
    if (!date) return "ไม่มีข้อมูล";
    return formatDistanceToNow(date, { addSuffix: true, locale: th });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">เลือกอุปกรณ์และค่าที่ต้องการแสดง</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="ค้นหาอุปกรณ์หรือค่าการวัด"
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Tabs defaultValue="devices">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="devices">อุปกรณ์</TabsTrigger>
              <TabsTrigger value="measurements" disabled={!selectedDevice}>ค่าคุณภาพ</TabsTrigger>
            </TabsList>
            
            <TabsContent value="devices" className="space-y-2">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center p-3 mb-2">
                    <Skeleton className="h-10 w-10 rounded-full mr-3" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))
              ) : filteredDevices.length > 0 ? (
                filteredDevices.map((device) => (
                  <div
                    key={device.device_code}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedDevice === device.device_code
                        ? "bg-purple-100 border border-purple-300"
                        : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                    }`}
                    onClick={() => setSelectedDevice(device.device_code)}
                  >
                    <p className="font-medium text-gray-800">{device.device_name}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>อัปเดตล่าสุด: {formatLastUpdated(device.last_updated)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">
                  ไม่พบอุปกรณ์ที่ตรงกับการค้นหา
                </p>
              )}
            </TabsContent>
            
            <TabsContent value="measurements" className="space-y-2">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center p-3 mb-2">
                    <Skeleton className="h-10 w-10 rounded-full mr-3" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))
              ) : filteredMeasurements.length > 0 ? (
                <div className="grid gap-0">
                  {filteredMeasurements.map((measurement) => {
                    const iconColor = getIconColor(measurement.symbol);
                    const thaiName = getThaiName(measurement.symbol, measurement.name);
                    
                    return (
                      <div
                        key={measurement.symbol}
                        onClick={() => handleSelectMeasurement(measurement.symbol, thaiName)}
                        className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50 hover:brightness-95 transition-all duration-300 relative overflow-hidden cursor-pointer"
                      >
                        {/* Background layer */}
                        <div className="absolute inset-0 w-full h-full bg-white opacity-80"></div>
                        
                        <div className="flex items-center relative z-10">
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center mr-3 shadow-md relative overflow-hidden"
                            style={{ background: `linear-gradient(135deg, ${iconColor}, ${iconColor}cc)` }}
                          >
                            <div className="absolute inset-0 bg-white/10"></div>
                            <div className="absolute top-0 left-0 w-3 h-3 bg-white/30 rounded-full blur-sm"></div>
                            <Wheat className="h-5 w-5 text-white" />
                          </div>
                          <div className="px-3 py-2">
                            <h3 className="font-bold text-base text-gray-800">{thaiName}</h3>
                            <span className="text-xs text-gray-500">{measurement.symbol}</span>
                          </div>
                        </div>
                        <div className="text-right relative z-10">
                          <p className="font-bold text-base text-gray-600">
                            {typeof measurement.value === 'number' ? 
                              `${measurement.value.toFixed(1)}%` : 
                              measurement.value || '0%'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">
                  ไม่พบค่าคุณภาพที่ตรงกับการค้นหา
                </p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
