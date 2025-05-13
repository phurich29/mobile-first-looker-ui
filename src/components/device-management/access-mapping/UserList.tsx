
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface User {
  id: string;
  email: string;
}

interface Device {
  device_code: string;
}

interface UserListProps {
  users: User[];
  devices: Device[];
  deviceUserMap: Record<string, string[]>;
  selectedUser: string | null;
  onSelect: (userId: string) => void;
}

export function UserListSelector({ 
  users,
  devices,
  deviceUserMap,
  selectedUser,
  onSelect
}: UserListProps) {
  const [userFilter, setUserFilter] = useState("");
  
  // Filter users based on search input
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(userFilter.toLowerCase())
  );
  
  // Get devices that a specific user has access to
  const getDevicesForUser = (userId: string) => {
    return devices.filter(device => 
      (deviceUserMap[device.device_code] || []).includes(userId)
    );
  };
  
  return (
    <Card>
      <CardContent className="max-h-[400px] overflow-y-auto pt-4">
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="ค้นหาผู้ใช้..."
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        
        {filteredUsers.length === 0 ? (
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
                onClick={() => onSelect(user.id)}
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
  );
}
