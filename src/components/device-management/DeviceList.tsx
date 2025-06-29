
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RefreshCw, Search, Settings, ChevronDown, ChevronUp } from "lucide-react";
import { DeviceAccessConfig } from "./DeviceAccessConfig";

interface Device {
  device_code: string;
  display_name?: string;
}

interface User {
  id: string;
  email: string;
}

interface DeviceListProps {
  devices: Device[];
  deviceUserMap: Record<string, string[]>;
  userDetailsMap: Record<string, User>;
  isLoading: boolean;
  onRefresh: () => Promise<void>;
  onSelectDevice: (deviceCode: string) => void;
}

export function DeviceList({ 
  devices, 
  deviceUserMap, 
  userDetailsMap,
  isLoading, 
  onRefresh,
  onSelectDevice 
}: DeviceListProps) {
  const [deviceFilter, setDeviceFilter] = useState("");
  const [expandedDevice, setExpandedDevice] = useState<string | null>(null);
  const [localDeviceUserMap, setLocalDeviceUserMap] = useState(deviceUserMap);
  
  // Update local state when props change
  useEffect(() => {
    setLocalDeviceUserMap(deviceUserMap);
  }, [deviceUserMap]);

  // Filter devices based on search input (search both device code and display name)
  const filteredDevices = devices.filter(device => 
    device.device_code.toLowerCase().includes(deviceFilter.toLowerCase()) ||
    (device.display_name && device.display_name.toLowerCase().includes(deviceFilter.toLowerCase()))
  );

  // Get user emails for a device
  const getUserEmails = (deviceCode: string) => {
    const userIds = localDeviceUserMap[deviceCode] || [];
    return userIds
      .map(userId => userDetailsMap[userId]?.email || 'Unknown')
      .filter(email => email !== 'Unknown')
      .sort();
  };

  // Handle device access changes
  const handleAccessChange = (deviceCode: string, updatedUsers: string[]) => {
    setLocalDeviceUserMap(prev => ({
      ...prev,
      [deviceCode]: updatedUsers
    }));
  };

  // Toggle device configuration panel
  const toggleDeviceConfig = (deviceCode: string) => {
    setExpandedDevice(prev => prev === deviceCode ? null : deviceCode);
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          รายการอุปกรณ์ทั้งหมด
        </CardTitle>
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
          <div className="space-y-4">
            {filteredDevices.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                {devices.length === 0 ? "ไม่พบข้อมูลอุปกรณ์" : "ไม่พบอุปกรณ์ที่ตรงกับการค้นหา"}
              </div>
            ) : (
              filteredDevices.map((device) => {
                const userEmails = getUserEmails(device.device_code);
                const isExpanded = expandedDevice === device.device_code;
                
                return (
                  <Collapsible
                    key={device.device_code}
                    open={isExpanded}
                    onOpenChange={() => toggleDeviceConfig(device.device_code)}
                  >
                    <div className="border rounded-lg">
                      <CollapsibleTrigger asChild>
                        <div className="w-full p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                              <div className="font-medium">
                                {device.display_name || device.device_code}
                                {device.display_name && device.display_name !== device.device_code && (
                                  <div className="text-sm text-gray-600">{device.device_code}</div>
                                )}
                              </div>
                              
                              <div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                  {userEmails.length} คน
                                </span>
                              </div>
                              
                              <div className="max-w-xs">
                                {userEmails.length > 0 ? (
                                  <div className="text-sm text-gray-600">
                                    {userEmails.length <= 2 ? (
                                      <div className="space-y-1">
                                        {userEmails.map(email => (
                                          <div key={email} className="truncate">{email}</div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="space-y-1">
                                        <div className="truncate">{userEmails[0]}</div>
                                        <div className="text-xs text-gray-500">
                                          และอีก {userEmails.length - 1} คน
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-sm">ไม่มีผู้ใช้</span>
                                )}
                              </div>
                              
                              <div className="flex items-center justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="hover:bg-emerald-50 hover:border-emerald-300"
                                >
                                  จัดการสิทธิ์
                                  {isExpanded ? (
                                    <ChevronUp className="h-4 w-4 ml-1" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4 ml-1" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <div className="border-t bg-gray-50/50 p-4">
                          <DeviceAccessConfig
                            deviceCode={device.device_code}
                            displayName={device.display_name}
                            currentUsers={localDeviceUserMap[device.device_code] || []}
                            userDetailsMap={userDetailsMap}
                            onAccessChange={handleAccessChange}
                          />
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })
            )}
          </div>
        )}
        
        {!isLoading && devices.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            แสดง {filteredDevices.length} จาก {devices.length} อุปกรณ์
          </div>
        )}
      </CardContent>
    </Card>
  );
}
