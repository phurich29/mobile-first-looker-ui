
import { useState, useEffect } from "react";
import { AccessMappingHeader } from './AccessMappingHeader';
import { DeviceListSelector } from './DeviceList';
import { DeviceUserTable } from './DeviceUserTable';
import { UserListSelector } from './UserList';
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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

export const AccessMapping = ({
  devices,
  users,
  deviceUserMap,
  selectedDevice,
  selectedUser,
  isLoading,
  onRefresh,
  setDeviceUserMap
}: AccessMappingProps) => {
  const { toast } = useToast();
  const [localSelectedDevice, setLocalSelectedDevice] = useState<string | null>(selectedDevice);
  const [localSelectedUser, setLocalSelectedUser] = useState<string | null>(selectedUser);

  // Update local state when props change
  useEffect(() => {
    setLocalSelectedDevice(selectedDevice);
    setLocalSelectedUser(selectedUser);
  }, [selectedDevice, selectedUser]);

  // Handle device selection
  const handleDeviceSelect = (deviceCode: string) => {
    setLocalSelectedDevice(prev => prev === deviceCode ? null : deviceCode);
    setLocalSelectedUser(null);
  };

  // Handle user selection
  const handleUserSelect = (userId: string) => {
    setLocalSelectedUser(prev => prev === userId ? null : userId);
    setLocalSelectedDevice(null);
  };

  // Toggle access for a device or user
  const toggleAccess = async (itemId: string) => {
    try {
      const deviceCode = localSelectedDevice;
      const userId = localSelectedUser;
      
      // If we have a selected device, we're toggling access for a user
      if (deviceCode) {
        const hasAccess = (deviceUserMap[deviceCode] || []).includes(itemId);
        
        if (hasAccess) {
          // Remove access
          const { error } = await supabase
            .from('user_device_access')
            .delete()
            .match({ device_code: deviceCode, user_id: itemId });
            
          if (error) throw error;
          
          // Update local state
          setDeviceUserMap(prev => ({
            ...prev,
            [deviceCode]: (prev[deviceCode] || []).filter(uid => uid !== itemId)
          }));
          
          toast({
            title: "สิทธิ์การเข้าถึงถูกเพิกถอน",
            description: `ผู้ใช้ไม่สามารถเข้าถึงอุปกรณ์ ${deviceCode} ได้อีกต่อไป`,
          });
        } else {
          // Grant access
          const { error } = await supabase
            .from('user_device_access')
            .insert({
              device_code: deviceCode,
              user_id: itemId,
              created_by: (await supabase.auth.getUser()).data.user?.id
            });
            
          if (error) throw error;
          
          // Update local state
          setDeviceUserMap(prev => ({
            ...prev,
            [deviceCode]: [...(prev[deviceCode] || []), itemId]
          }));
          
          toast({
            title: "สิทธิ์การเข้าถึงถูกมอบให้",
            description: `ผู้ใช้สามารถเข้าถึงอุปกรณ์ ${deviceCode} ได้แล้ว`,
          });
        }
      }
      
      // If we have a selected user, we're toggling access for a device
      else if (userId) {
        const hasAccess = Object.entries(deviceUserMap)
          .some(([devCode, userIds]) => devCode === itemId && userIds.includes(userId));
        
        if (hasAccess) {
          // Remove access
          const { error } = await supabase
            .from('user_device_access')
            .delete()
            .match({ device_code: itemId, user_id: userId });
            
          if (error) throw error;
          
          // Update local state
          setDeviceUserMap(prev => ({
            ...prev,
            [itemId]: (prev[itemId] || []).filter(uid => uid !== userId)
          }));
          
          toast({
            title: "สิทธิ์การเข้าถึงถูกเพิกถอน",
            description: `ผู้ใช้ไม่สามารถเข้าถึงอุปกรณ์ ${itemId} ได้อีกต่อไป`,
          });
        } else {
          // Grant access
          const { error } = await supabase
            .from('user_device_access')
            .insert({
              device_code: itemId,
              user_id: userId,
              created_by: (await supabase.auth.getUser()).data.user?.id
            });
            
          if (error) throw error;
          
          // Update local state
          setDeviceUserMap(prev => ({
            ...prev,
            [itemId]: [...(prev[itemId] || []), userId]
          }));
          
          toast({
            title: "สิทธิ์การเข้าถึงถูกมอบให้",
            description: `ผู้ใช้สามารถเข้าถึงอุปกรณ์ ${itemId} ได้แล้ว`,
          });
        }
      }
      
      // Refresh data after changes
      await onRefresh();
      
    } catch (error) {
      console.error("Error toggling access:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัพเดทสิทธิ์การเข้าถึงได้",
        variant: "destructive",
      });
    }
  };
  
  // Get items to display in the device-user table
  const getItemsForTable = () => {
    if (localSelectedDevice) {
      return users.map(user => ({
        id: user.id,
        name: user.email
      }));
    } else if (localSelectedUser) {
      return devices.map(device => ({
        id: device.device_code,
        name: device.device_code
      }));
    }
    return [];
  };
  
  // Check if an item has access
  const hasAccess = (itemId: string) => {
    if (localSelectedDevice) {
      return (deviceUserMap[localSelectedDevice] || []).includes(itemId);
    } else if (localSelectedUser) {
      return (deviceUserMap[itemId] || []).includes(localSelectedUser);
    }
    return false;
  };

  return (
    <div className="space-y-4">
      <Card>
        <AccessMappingHeader 
          selectedDevice={localSelectedDevice} 
          selectedUser={localSelectedUser} 
          users={users}
        />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <DeviceListSelector
              devices={devices}
              deviceUserMap={deviceUserMap}
              selectedDevice={localSelectedDevice}
              onSelect={handleDeviceSelect}
            />
            <UserListSelector
              users={users}
              devices={devices}
              deviceUserMap={deviceUserMap}
              selectedUser={localSelectedUser}
              onSelect={handleUserSelect}
            />
          </div>
          
          {(localSelectedDevice || localSelectedUser) && (
            <DeviceUserTable
              isLoading={isLoading}
              items={getItemsForTable()}
              hasAccess={hasAccess}
              onToggleAccess={toggleAccess}
              isUserTable={!!localSelectedDevice}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
