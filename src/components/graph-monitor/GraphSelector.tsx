
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Wheat, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { getColumnThaiName } from "@/lib/columnTranslations";
import { COLUMN_ORDER } from "@/features/device-details/components/device-history/utils";

interface GraphSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectGraph: (deviceCode: string, symbol: string, name: string, deviceName?: string) => void;
  deviceFilter?: string;
}

interface Device {
  device_code: string;
  display_name: string | null;
  updated_at: string;
}

interface Measurement {
  symbol: string;
  name: string;
  category: string;
  icon: React.ElementType;
}

const DEFAULT_CATEGORY = "ข้อมูลทั่วไป";

// Define categories for measurements - all will use Wheat icon
const MEASUREMENT_INFO: Record<string, { category: string; icon: React.ElementType }> = {
  // พื้นข้าวเต็มเมล็ด (Whole Kernel Rice Base)
  whole_kernels: { category: "พื้นข้าวเต็มเมล็ด", icon: Wheat },
  head_rice: { category: "พื้นข้าวเต็มเมล็ด", icon: Wheat },
  whiteness: { category: "พื้นข้าวเต็มเมล็ด", icon: Wheat },
  process_precision: { category: "พื้นข้าวเต็มเมล็ด", icon: Wheat },
  class1: { category: "พื้นข้าวเต็มเมล็ด", icon: Wheat },
  slender_kernel: { category: "พื้นข้าวเต็มเมล็ด", icon: Wheat },
  short_grain: { category: "พื้นข้าวเต็มเมล็ด", icon: Wheat },

  // ส่วนผสม (Ingredients/Mixture)
  class2: { category: "ส่วนผสม", icon: Wheat },
  class3: { category: "ส่วนผสม", icon: Wheat },
  total_brokens: { category: "ส่วนผสม", icon: Wheat },
  small_brokens: { category: "ส่วนผสม", icon: Wheat },
  small_brokens_c1: { category: "ส่วนผสม", icon: Wheat },
  sticky_rice_rate: { category: "ส่วนผสม", icon: Wheat },
  parboiled_white_rice: { category: "ส่วนผสม", icon: Wheat },
  parboiled_red_line: { category: "ส่วนผสม", icon: Wheat },
  
  // สิ่งเจือปน (Impurities)
  impurity_num: { category: "สิ่งเจือปน", icon: Wheat },
  paddy_rate: { category: "สิ่งเจือปน", icon: Wheat },
  red_line_rate: { category: "สิ่งเจือปน", icon: Wheat },
  honey_rice: { category: "สิ่งเจือปน", icon: Wheat },
  yellow_rice_rate: { category: "สิ่งเจือปน", icon: Wheat },
  black_kernel: { category: "สิ่งเจือปน", icon: Wheat },
  partly_black_peck: { category: "สิ่งเจือปน", icon: Wheat },
  partly_black: { category: "สิ่งเจือปน", icon: Wheat },
  imperfection_rate: { category: "สิ่งเจือปน", icon: Wheat }
};

export const GraphSelector: React.FC<GraphSelectorProps> = ({ 
  open, 
  onOpenChange, 
  onSelectGraph, 
  deviceFilter 
}) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [availableMeasurements, setAvailableMeasurements] = useState<Measurement[]>([]);
  const { user, userRoles } = useAuth();

  // Load devices when component mounts
  useEffect(() => {
    if (open) {
      loadDevices();
      // Prepare available measurements from COLUMN_ORDER - all use Wheat icon
      const dynamicMeasurements = COLUMN_ORDER.filter(
        key => !['thai_datetime', 'device_code', 'sample_index', 'output', 'id', 'created_at'].includes(key)
      ).map(key => {
        const info = MEASUREMENT_INFO[key] || { category: DEFAULT_CATEGORY, icon: Wheat };
        return {
          symbol: key,
          name: getColumnThaiName(key) || key,
          category: info.category,
          icon: Wheat // Force all icons to be Wheat
        };
      });
      setAvailableMeasurements(dynamicMeasurements);
    }
  }, [open, user]);

  // Auto-select device if deviceFilter is provided
  useEffect(() => {
    if (deviceFilter && devices.length > 0) {
      setSelectedDevice(deviceFilter);
    }
  }, [deviceFilter, devices]);

  const loadDevices = async () => {
    setLoading(true);
    try {
      const isAdmin = userRoles.includes('admin');
      const isSuperadmin = userRoles.includes('superadmin');
      
      const { data, error } = await supabase
        .rpc('get_devices_with_details', {
          user_id_param: user?.id || null,
          is_admin_param: isAdmin,
          is_superadmin_param: isSuperadmin
        });

      if (error) {
        console.error("Error loading devices:", error);
        return;
      }

      let deviceList = data || [];
      
      // If deviceFilter is provided, filter to only that device
      if (deviceFilter) {
        deviceList = deviceList.filter(device => device.device_code === deviceFilter);
      }

      setDevices(deviceList);
      
      // Auto-select first device if no filter is provided
      if (!deviceFilter && deviceList.length > 0) {
        setSelectedDevice(deviceList[0].device_code);
      }
    } catch (err) {
      console.error("Unexpected error loading devices:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMeasurement = (measurement: Measurement) => {
    if (!selectedDevice) return;
    
    const device = devices.find(d => d.device_code === selectedDevice);
    const deviceName = device?.display_name || `อุปกรณ์วัด ${selectedDevice}`;
    
    onSelectGraph(
      selectedDevice,
      measurement.symbol,
      measurement.name,
      deviceName
    );
    
    // Don't close dialog for device-filtered selector to allow multiple selections
    if (!deviceFilter) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {deviceFilter ? 
              `เลือกข้อมูลที่ต้องการแสดงในกราฟ` : 
              "เลือกอุปกรณ์และข้อมูลที่ต้องการแสดงในกราฟ"
            }
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full space-y-4">
          {/* Device selector - hide if deviceFilter is provided */}
          {!deviceFilter && (
            <div>
              <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">เลือกอุปกรณ์</h3>
              <ScrollArea className="h-32">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {loading ? (
                    <div className="col-span-2 text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                  ) : (
                    devices.map((device) => (
                      <Button
                        key={device.device_code}
                        variant={selectedDevice === device.device_code ? "default" : "outline"}
                        className="justify-start h-auto p-3"
                        onClick={() => setSelectedDevice(device.device_code)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        <div className="text-left">
                          <div className="font-medium">
                            {device.display_name || `อุปกรณ์ ${device.device_code}`}
                          </div>
                          <div className="text-xs opacity-70">
                            {device.device_code}
                          </div>
                        </div>
                      </Button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Measurement selector */}
          <div className="flex-1">
            <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">
              เลือกประเภทข้อมูล
              {deviceFilter && (
                <Badge variant="outline" className="ml-2">
                  {devices.find(d => d.device_code === deviceFilter)?.display_name || deviceFilter}
                </Badge>
              )}
            </h3>
            <ScrollArea className="h-80">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableMeasurements.map((measurement) => (
                  <Button
                    key={measurement.symbol}
                    variant="outline"
                    className="h-auto p-4 justify-start text-left hover:bg-blue-50 dark:hover:bg-blue-950"
                    onClick={() => handleSelectMeasurement(measurement)}
                    disabled={!selectedDevice && !deviceFilter}
                  >
                    <div className="flex items-start space-x-3 w-full">
                      <div className="flex-shrink-0 mt-1">
                        <Wheat className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {measurement.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {measurement.category}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
