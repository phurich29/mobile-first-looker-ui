
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DevicesList } from "./DevicesList";
import { MeasurementsList } from "./MeasurementsList";
import { useGraphSelector } from "./useGraphSelector";
import { SelectedGraph } from "../types";
import { useDeviceContext } from "@/contexts/DeviceContext";

interface GraphSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectGraph: ((deviceCode: string, symbol: string, name: string, deviceName?: string) => void) | ((graph: SelectedGraph) => void);
}

export const GraphSelector: React.FC<GraphSelectorProps> = ({
  open,
  onOpenChange,
  onSelectGraph,
}) => {
  const [activeTab, setActiveTab] = useState<"devices" | "measurements">("devices");
  const { selectedDeviceCode } = useDeviceContext();
  
  const {
    loading,
    devices,
    measurements,
    selectedDevice,
    searchQuery,
    setSearchQuery,
    setSelectedDevice,
    fetchDevices,
    getSelectedDeviceName,
    fetchMeasurements,
  } = useGraphSelector();

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      // If we have a selected device, we can start with measurements tab
      if (selectedDeviceCode) {
        setSelectedDevice(selectedDeviceCode);
        // Fetch measurements for the device
        fetchMeasurements(selectedDeviceCode);
        // Jump directly to measurements tab
        setActiveTab("measurements");
      } else {
        setActiveTab("devices");
        fetchDevices();
      }
    }
  }, [open, selectedDeviceCode]);

  // When a device is selected, switch to measurements tab
  useEffect(() => {
    if (selectedDevice) {
      setActiveTab("measurements");
    }
  }, [selectedDevice]);

  // Handle back button to go back to devices
  const handleBackToDevices = () => {
    setActiveTab("devices");
  };

  // Handle measurement selection
  const handleSelectMeasurement = (symbol: string, name: string) => {
    if (selectedDevice) {
      // Get the device name
      const deviceName = getSelectedDeviceName();
      
      // Call onSelectGraph properly
      if (typeof onSelectGraph === 'function') {
        try {
          // Pass device name as the fourth parameter
          (onSelectGraph as (deviceCode: string, symbol: string, name: string, deviceName?: string) => void)(
            selectedDevice, 
            symbol, 
            name,
            deviceName
          );
        } catch (e) {
          // Fallback to the old interface if error occurs
          console.log("Falling back to old interface");
          (onSelectGraph as any)(selectedDevice, symbol, name);
        }
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {activeTab === "devices" ? "เลือกอุปกรณ์" : "เลือกค่าที่ต้องการดู"}
          </DialogTitle>
          <DialogDescription>
            {activeTab === "devices"
              ? "เลือกอุปกรณ์ที่ต้องการดูข้อมูล"
              : `เลือกค่าที่ต้องการแสดงจากอุปกรณ์ ${getSelectedDeviceName()}`}
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหา..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "devices" | "measurements")}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="mb-2">
            <TabsTrigger value="devices">อุปกรณ์</TabsTrigger>
            <TabsTrigger value="measurements" disabled={!selectedDevice}>
              ค่าที่ต้องการวัด
            </TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto flex-1 pr-2">
            <TabsContent value="devices" className="mt-0">
              <DevicesList
                devices={devices}
                selectedDevice={selectedDevice}
                loading={loading}
                onSelectDevice={setSelectedDevice}
                defaultDeviceCode={selectedDeviceCode}
              />
            </TabsContent>

            <TabsContent value="measurements" className="mt-0">
              {selectedDevice && (
                <MeasurementsList
                  measurements={measurements}
                  loading={loading}
                  deviceCode={selectedDevice}
                  deviceName={getSelectedDeviceName()}
                  onSelectMeasurement={handleSelectMeasurement}
                />
              )}
            </TabsContent>
          </div>
        </Tabs>

        {activeTab === "measurements" && (
          <div className="flex justify-between mt-4">
            <button
              onClick={handleBackToDevices}
              className="text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              ← กลับไปเลือกอุปกรณ์
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export function GraphSelectorComponent() {
  return <div>Graph Selector Component</div>;
}
