
import { useState } from "react";
import { DeviceTabs } from "@/components/device-management/DeviceTabs";
import { DeviceList } from "@/components/device-management/DeviceList";
import { UserList } from "@/components/device-management/UserList";
import { AccessMapping } from "@/components/device-management/AccessMapping";
import { TabsContent } from "@/components/ui/tabs";

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
  const [localDeviceUserMap, setLocalDeviceUserMap] = useState(deviceUserMap);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("devices");
  
  const handleSelectDevice = (deviceCode: string) => {
    setSelectedDevice(prev => prev === deviceCode ? null : deviceCode);
    setSelectedUser(null);
    if (selectedDevice !== deviceCode) {
      setActiveTab("mapping");
    }
  };
  
  const handleSelectUser = (userId: string) => {
    setSelectedUser(prev => prev === userId ? null : userId);
    setSelectedDevice(null);
    if (selectedUser !== userId) {
      setActiveTab("mapping");
    }
  };
  
  return (
    <DeviceTabs value={activeTab} onValueChange={setActiveTab}>
      <TabsContent value="devices">
        <DeviceList 
          devices={devices}
          deviceUserMap={localDeviceUserMap}
          isLoading={isLoading}
          onRefresh={onRefresh}
          onSelectDevice={handleSelectDevice}
        />
      </TabsContent>
      
      <TabsContent value="users">
        <UserList 
          users={users}
          devices={devices}
          deviceUserMap={localDeviceUserMap}
          isLoading={isLoading}
          onRefresh={onRefresh}
          onSelectUser={handleSelectUser}
        />
      </TabsContent>
      
      <TabsContent value="mapping">
        <AccessMapping 
          devices={devices}
          users={users}
          deviceUserMap={localDeviceUserMap}
          selectedDevice={selectedDevice}
          selectedUser={selectedUser}
          isLoading={isLoading}
          onRefresh={onRefresh}
          setDeviceUserMap={setLocalDeviceUserMap}
        />
      </TabsContent>
    </DeviceTabs>
  );
}
