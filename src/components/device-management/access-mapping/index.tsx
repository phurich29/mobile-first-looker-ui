
import { DeviceListSelector } from "./DeviceList";
import { UserListSelector } from "./UserList";
import { AccessMappingHeader } from "./AccessMappingHeader";
import { Dispatch, SetStateAction, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

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
  setDeviceUserMap: Dispatch<SetStateAction<Record<string, string[]>>>;
}

const AccessMapping = ({ 
  devices,
  users,
  deviceUserMap, 
  selectedDevice: initialSelectedDevice,
  selectedUser: initialSelectedUser,
  isLoading,
  onRefresh,
  setDeviceUserMap
}: AccessMappingProps) => {
  const [selectedDevice, setSelectedDevice] = useState<string | null>(initialSelectedDevice);
  const [selectedUser, setSelectedUser] = useState<string | null>(initialSelectedUser);
  const { toast } = useToast();
  
  // Function to grant access to a device for a user
  const grantAccess = async (userId: string, deviceCode: string) => {
    try {
      // Check if access already exists
      const { data: existingAccess, error: checkError } = await supabase
        .from('user_device_access')
        .select('*')
        .eq('user_id', userId)
        .eq('device_code', deviceCode);
        
      if (checkError) throw checkError;
      
      // If access doesn't exist, create it
      if (!existingAccess || existingAccess.length === 0) {
        const { error } = await supabase
          .from('user_device_access')
          .insert({
            user_id: userId,
            device_code: deviceCode,
            created_by: (await supabase.auth.getUser()).data.user?.id
          });
          
        if (error) throw error;
        
        // Update local state
        setDeviceUserMap(prev => {
          const newMap = { ...prev };
          if (!newMap[deviceCode]) {
            newMap[deviceCode] = [];
          }
          if (!newMap[deviceCode].includes(userId)) {
            newMap[deviceCode] = [...newMap[deviceCode], userId];
          }
          return newMap;
        });
        
        toast({
          title: "เพิ่มสิทธิ์สำเร็จ",
          description: "เพิ่มสิทธิ์การเข้าถึงอุปกรณ์เรียบร้อยแล้ว"
        });
      }
    } catch (error) {
      console.error("Error granting access:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มสิทธิ์การเข้าถึงอุปกรณ์ได้",
        variant: "destructive"
      });
    }
  };
  
  // Function to revoke access to a device for a user
  const revokeAccess = async (userId: string, deviceCode: string) => {
    try {
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
        description: "ลบสิทธิ์การเข้าถึงอุปกรณ์เรียบร้อยแล้ว"
      });
    } catch (error) {
      console.error("Error revoking access:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบสิทธิ์การเข้าถึงอุปกรณ์ได้",
        variant: "destructive"
      });
    }
  };
  
  const handleSelectDevice = (deviceCode: string) => {
    setSelectedDevice(prev => prev === deviceCode ? null : deviceCode);
    setSelectedUser(null);
  };
  
  const handleSelectUser = (userId: string) => {
    setSelectedUser(prev => prev === userId ? null : userId);
    setSelectedDevice(null);
  };
  
  return (
    <div className="space-y-4">
      <AccessMappingHeader 
        selectedDevice={selectedDevice}
        selectedUser={selectedUser}
        users={users}
      />
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Device List */}
        <div>
          <h3 className="text-lg font-medium mb-3">อุปกรณ์</h3>
          <DeviceListSelector 
            devices={devices}
            deviceUserMap={deviceUserMap}
            selectedDevice={selectedDevice}
            onSelect={handleSelectDevice}
          />
        </div>
        
        {/* User List */}
        <div>
          <h3 className="text-lg font-medium mb-3">ผู้ใช้งาน</h3>
          <UserListSelector 
            users={users}
            devices={devices}
            deviceUserMap={deviceUserMap}
            selectedUser={selectedUser}
            onSelect={handleSelectUser}
          />
        </div>
      </div>
      
      {/* Action Panel */}
      {selectedDevice && selectedUser && (
        <div className="mt-6 p-4 border rounded-md bg-gray-50">
          <h3 className="text-lg font-medium mb-3">จัดการสิทธิ์</h3>
          
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">
                อุปกรณ์: <span className="text-emerald-600">{selectedDevice}</span>
              </p>
              <p className="text-sm font-medium">
                ผู้ใช้: <span className="text-emerald-600">{users.find(u => u.id === selectedUser)?.email}</span>
              </p>
            </div>
            
            <div className="space-x-2">
              {deviceUserMap[selectedDevice]?.includes(selectedUser) ? (
                <Button 
                  variant="destructive"
                  onClick={() => revokeAccess(selectedUser, selectedDevice)}
                >
                  ลบสิทธิ์การเข้าถึง
                </Button>
              ) : (
                <Button 
                  variant="default"
                  onClick={() => grantAccess(selectedUser, selectedDevice)}
                >
                  ให้สิทธิ์การเข้าถึง
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessMapping;
