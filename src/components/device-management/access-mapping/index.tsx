
import { AccessMappingHeader } from './AccessMappingHeader';
import { DeviceList } from './DeviceList';
import { DeviceUserTable } from './DeviceUserTable';
import { UserList } from './UserList';

export const AccessMapping = () => {
  return (
    <div>
      <AccessMappingHeader />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DeviceList />
        <UserList />
      </div>
      <DeviceUserTable />
    </div>
  );
};
