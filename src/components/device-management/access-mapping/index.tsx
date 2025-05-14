
import { AccessMappingHeader } from "./AccessMappingHeader";
import { DeviceUserTable } from "./DeviceUserTable";
import DeviceList from "./DeviceList";
import UserList from "./UserList";

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
  selectedDevice: string,
  selectedUser: string,
  isLoading: boolean,
  onRefresh: () => Promise<void>,
  setDeviceUserMap: (map: Record<string, string[]>) => void
}) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <AccessMappingHeader 
        selectedDevice={selectedDevice} 
        selectedUser={selectedUser} 
        users={users} 
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1">
          <DeviceList />
        </div>
        <div className="col-span-1">
          <UserList />
        </div>
        <div className="col-span-1">
          <DeviceUserTable 
            isLoading={isLoading} 
            items={[]} 
            hasAccess={() => false} 
            onToggleAccess={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

export default AccessMapping;
