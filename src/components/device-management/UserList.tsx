
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { RefreshCw, Search } from "lucide-react";

interface User {
  id: string;
  email: string;
}

interface UserListProps {
  users: User[];
  deviceUserMap: Record<string, string[]>;
  devices: { device_code: string }[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
  onSelectUser: (userId: string) => void;
}

export function UserList({ 
  users,
  devices,
  deviceUserMap,
  isLoading,
  onRefresh,
  onSelectUser
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
                        onClick={() => onSelectUser(user.id)}
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
  );
}
