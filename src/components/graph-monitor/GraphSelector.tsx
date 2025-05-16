
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { SelectedGraph } from "./types";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { REQUIRED_DEVICE_CODES } from "@/features/equipment/services/deviceDataService";

interface GraphSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectGraph: (graph: SelectedGraph) => void;
}

// Define the measurement types we want to offer
const MEASUREMENT_TYPES = [
  { symbol: 'whiteness', name: 'ความขาว' },
  { symbol: 'head_rice', name: 'ปริมาณต้นข้าว' },
  { symbol: 'whole_kernels', name: 'เมล็ดข้าวสมบูรณ์' },
  { symbol: 'imperfection_rate', name: 'อัตราความไม่สมบูรณ์' },
  { symbol: 'small_brokens', name: 'ปลายข้าว' },
  { symbol: 'small_brokens_c1', name: 'ปลายข้าว C1' },
  { symbol: 'total_brokens', name: 'ปริมาณข้าวหัก' },
  { symbol: 'paddy_rate', name: 'อัตราข้าวเปลือก' },
  { symbol: 'yellow_rice_rate', name: 'อัตราข้าวเหลือง' },
  { symbol: 'sticky_rice_rate', name: 'อัตราข้าวเหนียว' },
  { symbol: 'red_line_rate', name: 'อัตราข้าวมีเส้นแดง' }
];

export const GraphSelector = ({ open, onOpenChange, onSelectGraph }: GraphSelectorProps) => {
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState<Array<{ device_code: string; device_name: string }>>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [measurements, setMeasurements] = useState<Array<{ symbol: string; name: string }>>(MEASUREMENT_TYPES);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchDevices();
    }
  }, [open]);

  const fetchDevices = async () => {
    setLoading(true);
    setErrorMessage(null);
    
    try {
      // First, get device settings for all devices
      const { data: deviceSettingsData, error: deviceSettingsError } = await supabase
        .from('device_settings')
        .select('device_code, display_name')
        .order('display_name', { ascending: true });

      if (deviceSettingsError) {
        console.error("Error fetching device settings:", deviceSettingsError);
        setErrorMessage("ไม่สามารถโหลดข้อมูลอุปกรณ์ได้");
        return;
      }

      // Convert device settings to our format
      const deviceSettingsMap = new Map();
      (deviceSettingsData || []).forEach(item => {
        deviceSettingsMap.set(item.device_code, {
          device_code: item.device_code,
          device_name: item.display_name || item.device_code
        });
      });

      // Make sure all required devices are included
      const allDevices: Array<{ device_code: string; device_name: string }> = [];
      
      // First, add all known devices from settings
      deviceSettingsMap.forEach((device) => {
        allDevices.push(device);
      });

      // Then ensure all required devices are included
      for (const requiredCode of REQUIRED_DEVICE_CODES) {
        if (!deviceSettingsMap.has(requiredCode)) {
          // If we don't have settings for this device, add it with a default name
          allDevices.push({
            device_code: requiredCode,
            device_name: `อุปกรณ์ ${requiredCode}`
          });
        }
      }

      console.log(`Found ${allDevices.length} devices in total (including ${REQUIRED_DEVICE_CODES.length} required)`);
      
      // Sort by name for better UX
      allDevices.sort((a, b) => a.device_name.localeCompare(b.device_name));
      
      setDevices(allDevices);
    } catch (error) {
      console.error("Unexpected error fetching devices:", error);
      setErrorMessage("เกิดข้อผิดพลาดในการโหลดข้อมูลอุปกรณ์");
    } finally {
      setLoading(false);
    }
  };

  // Filter devices based on search query
  const filteredDevices = devices.filter(device => 
    (device.device_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    device.device_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter measurements based on search query
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-auto bg-background text-foreground">
        <DialogHeader>
          <DialogTitle className="text-center text-xl text-foreground">เลือกอุปกรณ์และค่าที่ต้องการแสดง</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาอุปกรณ์หรือค่าการวัด"
              className="pl-9 bg-background border-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Tabs defaultValue="devices">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="devices">อุปกรณ์</TabsTrigger>
              <TabsTrigger value="measurements" disabled={!selectedDevice}>การวัด</TabsTrigger>
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
              ) : errorMessage ? (
                <div className="p-4 text-center">
                  <p className="text-red-500 dark:text-red-400">{errorMessage}</p>
                  <Button 
                    onClick={fetchDevices} 
                    variant="outline" 
                    className="mt-2"
                  >
                    ลองอีกครั้ง
                  </Button>
                </div>
              ) : filteredDevices.length > 0 ? (
                filteredDevices.map((device) => (
                  <div
                    key={device.device_code}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedDevice === device.device_code
                        ? "bg-accent text-accent-foreground border border-accent"
                        : "bg-muted/50 hover:bg-muted border border-muted"
                    }`}
                    onClick={() => setSelectedDevice(device.device_code)}
                  >
                    <p className="font-medium">{device.device_name}</p>
                    <p className="text-xs text-muted-foreground">รหัส: {device.device_code}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  ไม่พบอุปกรณ์ที่ตรงกับการค้นหา
                </p>
              )}
            </TabsContent>
            
            <TabsContent value="measurements" className="space-y-2">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center p-3 mb-2">
                    <Skeleton className="h-4 w-40" />
                  </div>
                ))
              ) : filteredMeasurements.length > 0 ? (
                filteredMeasurements.map((measurement) => (
                  <div
                    key={measurement.symbol}
                    className="p-3 rounded-lg cursor-pointer transition-colors bg-muted/50 hover:bg-accent hover:text-accent-foreground border border-muted"
                    onClick={() => handleSelectMeasurement(measurement.symbol, measurement.name)}
                  >
                    <p className="font-medium">{measurement.name}</p>
                    <p className="text-xs text-muted-foreground">รหัส: {measurement.symbol}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  ไม่พบค่าการวัดที่ตรงกับการค้นหา
                </p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
