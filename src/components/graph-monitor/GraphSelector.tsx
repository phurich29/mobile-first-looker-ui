
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
import { useDeviceData } from "@/utils/deviceMeasurementUtils";

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

  useEffect(() => {
    if (open) {
      fetchDevices();
    }
  }, [open]);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('device_settings')
        .select('device_code, display_name')
        .order('display_name', { ascending: true });

      if (error) {
        console.error("Error fetching devices:", error);
        return;
      }

      // Format the response to match our device structure
      const formattedDevices = (data || []).map(item => ({
        device_code: item.device_code,
        device_name: item.display_name || item.device_code
      }));

      setDevices(formattedDevices);
    } catch (error) {
      console.error("Unexpected error:", error);
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
                    <p className="text-xs text-gray-500">รหัส: {device.device_code}</p>
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
                    <Skeleton className="h-4 w-40" />
                  </div>
                ))
              ) : filteredMeasurements.length > 0 ? (
                filteredMeasurements.map((measurement) => (
                  <div
                    key={measurement.symbol}
                    className="p-3 rounded-lg cursor-pointer transition-colors bg-gray-50 hover:bg-purple-50 border border-gray-200"
                    onClick={() => handleSelectMeasurement(measurement.symbol, measurement.name)}
                  >
                    <p className="font-medium text-gray-800">{measurement.name}</p>
                    <p className="text-xs text-gray-500">รหัส: {measurement.symbol}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">
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
