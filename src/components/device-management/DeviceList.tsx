
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { RefreshCw, Search } from "lucide-react";

interface Device {
  device_code: string;
}

interface DeviceListProps {
  devices: Device[];
  deviceUserMap: Record<string, string[]>;
  isLoading: boolean;
  onRefresh: () => Promise<void>;
  onSelectDevice: (deviceCode: string) => void;
}

export function DeviceList({ 
  devices, 
  deviceUserMap, 
  isLoading, 
  onRefresh,
  onSelectDevice 
}: DeviceListProps) {
  const [deviceFilter, setDeviceFilter] = useState("");
  
  // Filter devices based on search input
  const filteredDevices = devices.filter(device => 
    device.device_code.toLowerCase().includes(deviceFilter.toLowerCase())
  );
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>รายการอุปกรณ์ทั้งหมด</CardTitle>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            <span>รีเฟรช</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="ค้นหาอุปกรณ์..."
              value={deviceFilter}
              onChange={(e) => setDeviceFilter(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <ResponsiveTable>
            <TableHeader>
              <TableRow>
                <TableHead>รหัสอุปกรณ์</TableHead>
                <TableHead>จำนวนผู้ใช้ที่มีสิทธิ์เข้าถึง</TableHead>
                <TableHead className="text-right">การจัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDevices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    ไม่พบข้อมูลอุปกรณ์
                  </TableCell>
                </TableRow>
              ) : (
                filteredDevices.map((device) => (
                  <TableRow key={device.device_code}>
                    <TableCell className="font-medium">{device.device_code}</TableCell>
                    <TableCell>
                      {(deviceUserMap[device.device_code] || []).length} คน
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onSelectDevice(device.device_code)}
                      >
                        จัดการสิทธิ์
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </ResponsiveTable>
        )}
      </CardContent>
    </Card>
  );
}
