
import { AccessMappingHeader } from "./AccessMappingHeader";
import { DeviceUserTable } from "./DeviceUserTable";
import { DeviceListSelector } from "./DeviceList";
import { UserListSelector } from "./UserList";

export const AccessMapping = ({ 
  devices,
  users,
  deviceUserMap, 
  selectedDevice,
  selectedUser,
  isLoading,
  onRefresh,
  setDeviceUserMap
}: {
  devices: any[],
  users: any[],
  deviceUserMap: Record<string, string[]>,
  selectedDevice: string | null,
  selectedUser: string | null,
  isLoading: boolean,
  onRefresh: () => Promise<void>,
  setDeviceUserMap: (map: Record<string, string[]>) => void
}) => {
  // Determine which items to show in the access table based on selection
  const getTableItems = () => {
    if (selectedDevice) {
      // Show users who have access to the selected device
      return users.map(user => ({
        id: user.id,
        name: user.email
      }));
    } else if (selectedUser) {
      // Show devices the selected user has access to
      return devices.map(device => ({
        id: device.device_code,
        name: device.device_code
      }));
    }
    return [];
  };

  // Check if a user has access to the selected device or if a device is accessible by the selected user
  const hasAccess = (itemId: string): boolean => {
    if (selectedDevice) {
      // Check if user has access to the selected device
      return (deviceUserMap[selectedDevice] || []).includes(itemId);
    } else if (selectedUser) {
      // Check if device gives access to the selected user
      return (deviceUserMap[itemId] || []).includes(selectedUser);
    }
    return false;
  };

  // Toggle access rights (returns a Promise to satisfy the type)
  const handleToggleAccess = async (itemId: string): Promise<void> => {
    const updatedMap = { ...deviceUserMap };
    
    if (selectedDevice) {
      // Toggle user access to the selected device
      if (hasAccess(itemId)) {
        // Remove user access
        updatedMap[selectedDevice] = (updatedMap[selectedDevice] || []).filter(id => id !== itemId);
      } else {
        // Add user access
        if (!updatedMap[selectedDevice]) {
          updatedMap[selectedDevice] = [];
        }
        updatedMap[selectedDevice].push(itemId);
      }
    } else if (selectedUser) {
      // Toggle device access for the selected user
      if (hasAccess(itemId)) {
        // Remove device access
        updatedMap[itemId] = (updatedMap[itemId] || []).filter(id => id !== selectedUser);
      } else {
        // Add device access
        if (!updatedMap[itemId]) {
          updatedMap[itemId] = [];
        }
        updatedMap[itemId].push(selectedUser);
      }
    }
    
    setDeviceUserMap(updatedMap);
    return Promise.resolve(); // Return a resolved promise to match the expected type
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <AccessMappingHeader 
        selectedDevice={selectedDevice} 
        selectedUser={selectedUser} 
        users={users} 
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1">
          <DeviceListSelector 
            devices={devices}
            deviceUserMap={deviceUserMap}
            selectedDevice={selectedDevice}
            onSelect={() => {}}
          />
        </div>
        <div className="col-span-1">
          <UserListSelector
            users={users}
            devices={devices}
            deviceUserMap={deviceUserMap}
            selectedUser={selectedUser}
            onSelect={() => {}}
          />
        </div>
        <div className="col-span-1">
          <DeviceUserTable 
            isLoading={isLoading} 
            items={getTableItems()} 
            hasAccess={hasAccess} 
            onToggleAccess={handleToggleAccess}
            isUserTable={!!selectedDevice}
          />
        </div>
      </div>
    </div>
  );
};

export default AccessMapping;
