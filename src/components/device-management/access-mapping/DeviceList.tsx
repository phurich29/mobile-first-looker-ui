
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Device {
  device_code: string;
}

interface DeviceListProps {
  devices: Device[];
  deviceUserMap: Record<string, string[]>;
  selectedDevice: string | null;
  onSelect: (deviceCode: string) => void;
}

export function DeviceListSelector({ 
  devices,
  deviceUserMap,
  selectedDevice,
  onSelect
}: DeviceListProps) {
  const [deviceFilter, setDeviceFilter] = useState("");
  
  // Filter devices based on search input
  const filteredDevices = devices.filter(device => 
    device.device_code.toLowerCase().includes(deviceFilter.toLowerCase())
  );
  
  return (
    <Card>
      <CardContent className="max-h-[400px] overflow-y-auto pt-4">
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="ค้นหาอุปกรณ์..."
            value={deviceFilter}
            onChange={(e) => setDeviceFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        
        {filteredDevices.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            ไม่พบข้อมูลอุปกรณ์
          </div>
        ) : (
          <div className="space-y-2">
            {filteredDevices.map(device => (
              <div 
                key={device.device_code}
                className={`p-3 rounded-md border cursor-pointer transition-colors ${
                  selectedDevice === device.device_code 
                    ? 'bg-emerald-50 border-emerald-300' 
                    : 'bg-white hover:bg-gray-50'
                }`}
                onClick={() => onSelect(device.device_code)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{device.device_code}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {(deviceUserMap[device.device_code] || []).length} ผู้ใช้งาน
                    </div>
                  </div>
                  {selectedDevice === device.device_code && (
                    <Badge className="bg-emerald-500">เลือก</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
