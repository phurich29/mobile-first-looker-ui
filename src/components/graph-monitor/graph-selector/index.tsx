
import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SelectedGraph } from "../types";
import { DevicesList } from "./DevicesList";
import { MeasurementsList } from "./MeasurementsList";
import { useGraphSelector } from "./useGraphSelector";

interface GraphSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectGraph: (graph: SelectedGraph) => void;
}

export const GraphSelector: React.FC<GraphSelectorProps> = ({ 
  open, 
  onOpenChange, 
  onSelectGraph 
}) => {
  const {
    loading,
    devices,
    measurements,
    selectedDevice,
    searchQuery,
    setSearchQuery,
    setSelectedDevice,
    fetchDevices,
    getSelectedDeviceName
  } = useGraphSelector();

  useEffect(() => {
    if (open) {
      fetchDevices();
    }
  }, [open]);

  const handleSelectMeasurement = (symbol: string, name: string) => {
    if (selectedDevice) {
      const selectedDeviceName = getSelectedDeviceName();
      
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
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-auto bg-gray-50 border-purple-200">
        <DialogHeader>
          <DialogTitle className="text-center text-xl text-gray-800">เลือกอุปกรณ์และค่าที่ต้องการแสดง</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-purple-400" />
            <Input
              placeholder="ค้นหาอุปกรณ์หรือค่าการวัด"
              className="pl-9 border-purple-200 focus:border-purple-400 focus:ring-purple-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Tabs defaultValue="devices" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-purple-100">
              <TabsTrigger 
                value="devices" 
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                อุปกรณ์
              </TabsTrigger>
              <TabsTrigger 
                value="measurements" 
                disabled={!selectedDevice}
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                ค่าคุณภาพ
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="devices" className="space-y-2">
              <DevicesList 
                devices={devices}
                selectedDevice={selectedDevice}
                loading={loading}
                onSelectDevice={setSelectedDevice}
              />
            </TabsContent>
            
            <TabsContent value="measurements" className="space-y-2">
              <MeasurementsList 
                measurements={measurements}
                loading={loading}
                deviceCode={selectedDevice}
                deviceName={getSelectedDeviceName()}
                onSelectMeasurement={handleSelectMeasurement}
              />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
