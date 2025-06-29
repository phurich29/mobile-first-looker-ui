
import { useState, useEffect } from "react";
import { DeviceTabs } from "@/components/device-management/DeviceTabs";
import { DeviceList } from "@/components/device-management/DeviceList";
import { UserList } from "@/components/device-management/UserList";
import AccessMapping from "@/components/device-management/access-mapping/index";
import { TabsContent } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

interface User {
  id: string;
  email: string;
}

interface Device {
  device_code: string;
  display_name?: string;
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
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Create user details map from users array
  const userDetailsMap: Record<string, User> = {};
  users.forEach(user => {
    userDetailsMap[user.id] = user;
  });
  
  useEffect(() => {
    // Listen for sidebar state changes using custom event
    const updateSidebarState = (event?: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent?.detail) {
        setIsCollapsed(customEvent.detail.isCollapsed);
      } else {
        const savedCollapsedState = localStorage.getItem('sidebarCollapsed');
        setIsCollapsed(savedCollapsedState === 'true');
      }
    };
    
    // Initial state
    updateSidebarState();
    
    // Listen for changes in localStorage
    window.addEventListener('storage', () => updateSidebarState());
    
    // Listen for custom event from Header component
    window.addEventListener('sidebarStateChanged', updateSidebarState);
    
    return () => {
      window.removeEventListener('storage', () => updateSidebarState());
      window.removeEventListener('sidebarStateChanged', updateSidebarState);
    };
  }, []);
  
  const handleSelectDevice = (deviceCode: string) => {
    setSelectedDevice(prev => prev === deviceCode ? null : deviceCode);
    setSelectedUser(null);
    if (selectedDevice !== deviceCode) {
      document.querySelector('[data-value="mapping"]')?.dispatchEvent(
        new MouseEvent('click', { bubbles: true })
      );
    }
  };
  
  const handleSelectUser = (userId: string) => {
    setSelectedUser(prev => prev === userId ? null : userId);
    setSelectedDevice(null);
    if (selectedUser !== userId) {
      document.querySelector('[data-value="mapping"]')?.dispatchEvent(
        new MouseEvent('click', { bubbles: true })
      );
    }
  };
  
  return (
    <DeviceTabs>
      {/* ส่วนแสดงข้อมูลอุปกรณ์ */}
      <TabsContent value="devices">
        <DeviceList 
          devices={devices}
          deviceUserMap={localDeviceUserMap}
          userDetailsMap={userDetailsMap}
          isLoading={isLoading}
          onRefresh={onRefresh}
          onSelectDevice={handleSelectDevice}
        />
      </TabsContent>
      
      {/* ส่วนแสดงข้อมูลผู้ใช้ */}
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
      
      {/* ส่วนจัดการการเข้าถึง */}
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
