
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Filter, Search, RefreshCw, Check, X, Devices, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface User {
  id: string;
  email: string;
}

interface Device {
  device_code: string;
}

interface DeviceManagementViewProps {
  devices: Device[];
  users: User[];
  deviceUserMap: Record<string, string[]>;
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}

export function DeviceManagementView({ 
  devices, 
  users, 
  deviceUserMap, 
  isLoading,
  onRefresh
}: DeviceManagementViewProps) {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [deviceFilter, setDeviceFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  
  // Filter devices based on search input
  const filteredDevices = devices.filter(device => 
    device.device_code.toLowerCase().includes(deviceFilter.toLowerCase())
  );
  
  // Filter users based on search input
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(userFilter.toLowerCase())
  );
  
  // Get users with access to a specific device
  const getUsersForDevice = (deviceCode: string) => {
    const userIds = deviceUserMap[deviceCode] || [];
    return users.filter(user => userIds.includes(user.id));
  };
  
  // Get devices that a specific user has access to
  const getDevicesForUser = (userId: string) => {
    return devices.filter(device => 
      (deviceUserMap[device.device_code] || []).includes(userId)
    );
  };
  
  // Toggle access for a user to a device
  const toggleAccess = async (userId: string, deviceCode: string) => {
    if (!currentUser) return;
    
    const hasAccess = (deviceUserMap[deviceCode] || []).includes(userId);
    
    try {
      if (hasAccess) {
        // Remove access
        const { error } = await supabase
          .from('user_device_access')
          .delete()
          .eq('user_id', userId)
          .eq('device_code', deviceCode);
          
        if (error) throw error;
        
        // Update local state
        setDeviceUserMap(prev => {
          const newMap = { ...prev };
          if (newMap[deviceCode]) {
            newMap[deviceCode] = newMap[deviceCode].filter(id => id !== userId);
          }
          return newMap;
        });
        
        toast({
          title: "ลบสิทธิ์สำเร็จ",
          description: "ลบสิทธิ์การเข้าถึงอุปกรณ์เรียบร้อยแล้ว",
        });
      } else {
        // Grant access
        const { error } = await supabase
          .from('user_device_access')
          .insert({
            user_id: userId,
            device_code: deviceCode,
            created_by: currentUser.id
          });
          
        if (error) throw error;
        
        // Update local state
        setDeviceUserMap(prev => {
          const newMap = { ...prev };
          if (!newMap[deviceCode]) {
            newMap[deviceCode] = [];
          }
          newMap[deviceCode] = [...newMap[deviceCode], userId];
          return newMap;
        });
        
        toast({
          title: "เพิ่มสิทธิ์สำเร็จ",
          description: "เพิ่มสิทธิ์การเข้าถึงอุปกรณ์เรียบร้อยแล้ว",
        });
      }
    } catch (error) {
      console.error("Error toggling access:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัพเดทสิทธิ์การเข้าถึงได้",
        variant: "destructive",
      });
    }
  };
  
  // Check if a user has access to a specific device
  const userHasAccessToDevice = (userId: string, deviceCode: string) => {
    return (deviceUserMap[deviceCode] || []).includes(userId);
  };
  
  return (
    <Tabs defaultValue="devices">
      <TabsList className="mb-6">
        <TabsTrigger value="devices" className="flex items-center gap-2">
          <Devices className="h-4 w-4" />
          <span>อุปกรณ์</span>
        </TabsTrigger>
        <TabsTrigger value="users" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>ผู้ใช้งาน</span>
        </TabsTrigger>
        <TabsTrigger value="mapping" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span>จัดการการเข้าถึง</span>
        </TabsTrigger>
      </TabsList>
      
      {/* ส่วนแสดงข้อมูลอุปกรณ์ */}
      <TabsContent value="devices">
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
                            onClick={() => {
                              setSelectedDevice(device.device_code);
                              setSelectedUser(null);
                              document.querySelector('[data-value="mapping"]')?.dispatchEvent(
                                new MouseEvent('click', { bubbles: true })
                              );
                            }}
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
      </TabsContent>
      
      {/* ส่วนแสดงข้อมูลผู้ใช้ */}
      <TabsContent value="users">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>รายการผู้ใช้งานทั้งหมด</CardTitle>
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
                  placeholder="ค้นหาผู้ใช้..."
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
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
                    <TableHead>อีเมล</TableHead>
                    <TableHead>จำนวนอุปกรณ์ที่เข้าถึงได้</TableHead>
                    <TableHead className="text-right">การจัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                        ไม่พบข้อมูลผู้ใช้
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>
                          {getDevicesForUser(user.id).length} เครื่อง
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user.id);
                              setSelectedDevice(null);
                              document.querySelector('[data-value="mapping"]')?.dispatchEvent(
                                new MouseEvent('click', { bubbles: true })
                              );
                            }}
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
      </TabsContent>
      
      {/* ส่วนจัดการการเข้าถึง */}
      <TabsContent value="mapping">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* รายการอุปกรณ์ */}
          <Card>
            <CardHeader>
              <CardTitle>รายการอุปกรณ์</CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="ค้นหาอุปกรณ์..."
                  value={deviceFilter}
                  onChange={(e) => setDeviceFilter(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
              ) : filteredDevices.length === 0 ? (
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
                      onClick={() => {
                        setSelectedDevice(device.device_code);
                        setSelectedUser(null);
                      }}
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
          
          {/* รายการผู้ใช้ */}
          <Card>
            <CardHeader>
              <CardTitle>รายการผู้ใช้งาน</CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="ค้นหาผู้ใช้..."
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  ไม่พบข้อมูลผู้ใช้
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map(user => (
                    <div 
                      key={user.id}
                      className={`p-3 rounded-md border cursor-pointer transition-colors ${
                        selectedUser === user.id 
                          ? 'bg-emerald-50 border-emerald-300' 
                          : 'bg-white hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        setSelectedUser(user.id);
                        setSelectedDevice(null);
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{user.email}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {getDevicesForUser(user.id).length} อุปกรณ์
                          </div>
                        </div>
                        {selectedUser === user.id && (
                          <Badge className="bg-emerald-500">เลือก</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* ส่วนแสดงและจัดการการเข้าถึง */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>
              {selectedDevice ? 
                `ผู้ใช้ที่เข้าถึงอุปกรณ์: ${selectedDevice}` : 
                selectedUser ? 
                  `อุปกรณ์ที่ผู้ใช้: ${users.find(u => u.id === selectedUser)?.email || ''} สามารถเข้าถึงได้` : 
                  'เลือกอุปกรณ์หรือผู้ใช้เพื่อจัดการการเข้าถึง'
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedDevice && !selectedUser ? (
              <div className="text-center text-muted-foreground py-12">
                กรุณาเลือกอุปกรณ์หรือผู้ใช้จากรายการด้านบน
              </div>
            ) : selectedDevice ? (
              // Show users who have access to the selected device
              <ResponsiveTable>
                <TableHeader>
                  <TableRow>
                    <TableHead>อีเมล</TableHead>
                    <TableHead className="text-right">การเข้าถึง</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center">
                        <div className="flex justify-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                        ไม่พบข้อมูลผู้ใช้
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map(user => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant={userHasAccessToDevice(user.id, selectedDevice) ? "destructive" : "outline"}
                            size="sm"
                            onClick={() => toggleAccess(user.id, selectedDevice)}
                          >
                            {userHasAccessToDevice(user.id, selectedDevice) ? (
                              <>
                                <X className="h-3.5 w-3.5 mr-1" />
                                <span>ยกเลิกสิทธิ์</span>
                              </>
                            ) : (
                              <>
                                <Check className="h-3.5 w-3.5 mr-1" />
                                <span>ให้สิทธิ์</span>
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </ResponsiveTable>
            ) : selectedUser ? (
              // Show devices the selected user has access to
              <ResponsiveTable>
                <TableHeader>
                  <TableRow>
                    <TableHead>รหัสอุปกรณ์</TableHead>
                    <TableHead className="text-right">การเข้าถึง</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center">
                        <div className="flex justify-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredDevices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                        ไม่พบข้อมูลอุปกรณ์
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDevices.map(device => (
                      <TableRow key={device.device_code}>
                        <TableCell className="font-medium">{device.device_code}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant={userHasAccessToDevice(selectedUser, device.device_code) ? "destructive" : "outline"}
                            size="sm"
                            onClick={() => toggleAccess(selectedUser, device.device_code)}
                          >
                            {userHasAccessToDevice(selectedUser, device.device_code) ? (
                              <>
                                <X className="h-3.5 w-3.5 mr-1" />
                                <span>ยกเลิกสิทธิ์</span>
                              </>
                            ) : (
                              <>
                                <Check className="h-3.5 w-3.5 mr-1" />
                                <span>ให้สิทธิ์</span>
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </ResponsiveTable>
            ) : null}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
