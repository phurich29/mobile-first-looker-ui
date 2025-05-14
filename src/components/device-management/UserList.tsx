
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { RefreshCw, Search } from "lucide-react";
import { useUserManagement } from "@/features/user-management/hooks/useUserManagement";
import { useToast } from "@/components/ui/use-toast";

interface User {
  id: string;
  email: string;
}

interface UserListProps {
  deviceUserMap: Record<string, string[]>;
  devices: { device_code: string }[];
  onSelectUser: (userId: string) => void;
}

export function UserList({ 
  devices,
  deviceUserMap,
  onSelectUser 
}: UserListProps) {
  const { toast } = useToast();
  const [userFilter, setUserFilter] = useState("");
  const { users, isLoadingUsers: isLoading } = useUserManagement();

  // อัพเดตข้อมูลผู้ใช้เมื่อ component โหลด
  useEffect(() => {
    // ข้อมูลผู้ใช้จะถูกโหลดโดยอัตโนมัติจาก useUserManagement
  }, []);
  
  // ฟังก์ชันรีเฟรชข้อมูล
  const handleRefresh = async () => {
    try {
      // รีโหลดหน้าเพื่อดึงข้อมูลใหม่
      window.location.reload();
      toast({
        title: "รีเฟรชข้อมูลสำเร็จ",
        description: "ข้อมูลผู้ใช้อัพเดตแล้ว",
      });
    } catch (error) {
      toast({
        title: "รีเฟรชข้อมูลไม่สำเร็จ",
        description: "เกิดข้อผิดพลาดในการอัพเดตข้อมูล",
        variant: "destructive",
      });
    }
  };
  
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
    <div className="w-full">
      <div className="flex flex-row items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">รายการผู้ใช้งานทั้งหมด</h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            <span>รีเฟรช</span>
          </Button>
        </div>
      </div>
      <div className="w-full">
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
      </div>
    </div>
  );
}
