import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { DeviceListSelector } from "./DeviceList";
import { UserListSelector } from "./UserList";
import { AccessMappingHeader } from "./AccessMappingHeader";
import { DeviceUserTable } from "./DeviceUserTable";

interface User {
  id: string;
  email: string;
}

interface Device {
  device_code: string;
}

interface AccessMappingProps {
  devices: Device[];
  users: User[];
  deviceUserMap: Record<string, string[]>;
  selectedDevice: string | null;
  selectedUser: string | null;
  isLoading: boolean;
  onRefresh: () => Promise<void>;
  setDeviceUserMap: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
}

export function AccessMapping({ 
  devices, 
  users, 
  deviceUserMap,
  selectedDevice,
  selectedUser,
  isLoading,
  onRefresh,
  setDeviceUserMap
}: AccessMappingProps) {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [deviceFilter, setDeviceFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");

  // Filter devices based on search input
  const filteredDevices = devices.filter(device => 
    device.device_code.toLowerCase().includes(deviceFilter.toLowerCase())
  );
  
  // Filter users based on search input - this will show all users
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(userFilter.toLowerCase())
  );

  // Check if a user has access to a specific device
  const userHasAccessToDevice = (userId: string, deviceCode: string) => {
    return (deviceUserMap[deviceCode] || []).includes(userId);
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
        
        toast("ลบสิทธิ์สำเร็จ: ลบสิทธิ์การเข้าถึงอุปกรณ์เรียบร้อยแล้ว");
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
        
        toast("เพิ่มสิทธิ์สำเร็จ: เพิ่มสิทธิ์การเข้าถึงอุปกรณ์เรียบร้อยแล้ว");
      }
    } catch (error) {
      console.error("Error toggling access:", error);
      toast("เกิดข้อผิดพลาด: ไม่สามารถอัพเดทสิทธิ์การเข้าถึงได้");
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Device list section */}
        <div>
          <h3 className="text-lg font-medium mb-2">รายการอุปกรณ์</h3>
          <DeviceListSelector
            devices={devices}
            deviceUserMap={deviceUserMap}
            selectedDevice={selectedDevice}
            onSelect={(deviceCode) => {}}
          />
        </div>
        
        {/* User list section */}
        <div>
          <h3 className="text-lg font-medium mb-2">รายการผู้ใช้งาน</h3>
          <UserListSelector
            users={users}
            devices={devices}
            deviceUserMap={deviceUserMap}
            selectedUser={selectedUser}
            onSelect={(userId) => {}}
          />
        </div>
      </div>
      
      {/* Access management section */}
      <Card className="mt-6">
        <AccessMappingHeader 
          selectedDevice={selectedDevice}
          selectedUser={selectedUser}
          users={users}
        />
        <CardContent>
          {!selectedDevice && !selectedUser ? (
            <div className="text-center text-muted-foreground py-12">
              กรุณาเลือกอุปกรณ์หรือผู้ใช้จากรายการด้านบน
            </div>
          ) : selectedDevice ? (
            // Show users who have access to the selected device
            <DeviceUserTable 
              isLoading={isLoading}
              items={filteredUsers.map(user => ({ id: user.id, name: user.email }))}
              hasAccess={(userId) => userHasAccessToDevice(userId, selectedDevice)}
              onToggleAccess={(userId) => toggleAccess(userId, selectedDevice)}
              isUserTable={true}
            />
          ) : selectedUser ? (
            // Show devices the selected user has access to
            <DeviceUserTable 
              isLoading={isLoading}
              items={filteredDevices.map(device => ({ id: device.device_code, name: device.device_code }))}
              hasAccess={(deviceCode) => userHasAccessToDevice(selectedUser, deviceCode)}
              onToggleAccess={(deviceCode) => toggleAccess(selectedUser, deviceCode)}
              isUserTable={false}
            />
          ) : null}
        </CardContent>
      </Card>
    </>
  );
}
