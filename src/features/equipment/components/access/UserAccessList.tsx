
import { CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "../../types";
import { toggleUserDeviceAccess } from "../../services/userAccessService";
import { useToast } from "@/hooks/use-toast";

interface UserAccessListProps {
  deviceCode: string;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setAllUsers: React.Dispatch<React.SetStateAction<User[]>>;
  isLoading: boolean;
}

export function UserAccessList({
  deviceCode,
  users,
  setUsers,
  setAllUsers,
  isLoading
}: UserAccessListProps) {
  const { toast } = useToast();
  
  // Toggle device access for a user
  const toggleAccess = async (userId: string, currentAccess: boolean) => {
    try {
      const success = await toggleUserDeviceAccess(userId, deviceCode, currentAccess);
      
      if (success) {
        // Update both filtered and all users lists
        const updateUser = (prevUsers: User[]) => 
          prevUsers.map(u => 
            u.id === userId ? { ...u, hasAccess: !currentAccess } : u
          );
        
        setUsers(updateUser);
        setAllUsers(updateUser);
        
        toast({
          title: "อัพเดทสิทธิ์สำเร็จ",
          description: currentAccess 
            ? "ลบสิทธิ์การเข้าถึงอุปกรณ์เรียบร้อยแล้ว" 
            : "เพิ่มสิทธิ์การเข้าถึงอุปกรณ์เรียบร้อยแล้ว",
        });
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "มีข้อผิดพลาดไม่คาดคิดเกิดขึ้น",
        variant: "destructive",
      });
    }
  };
  
  // Filter only users who have access to this device
  const usersWithAccess = users.filter(user => user.hasAccess);
  
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-medium">ผู้ใช้ที่มีสิทธิ์เข้าถึงอุปกรณ์นี้</h3>
      
      <div className="border rounded-md divide-y max-h-[300px] overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-sm text-gray-500">
            กำลังโหลดข้อมูลผู้ใช้...
          </div>
        ) : usersWithAccess.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            ไม่พบผู้ใช้ที่มีสิทธิ์เข้าถึงอุปกรณ์นี้
          </div>
        ) : (
          usersWithAccess.map((user) => (
            <div key={user.id} className="p-3 flex justify-between items-center">
              <div className="truncate flex-1">
                <div className="text-sm font-medium truncate">
                  {user.email}
                </div>
                <div className="text-xs text-green-600 mt-1">
                  {user.hasImplicitAccess ? 'สิทธิ์ตามบทบาท' : 'มีสิทธิ์เข้าถึง'}
                </div>
              </div>
              {user.hasImplicitAccess ? (
                <div className="ml-2 px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-full">
                  สิทธิ์ตามบทบาท
                </div>
              ) : (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => toggleAccess(user.id, user.hasAccess)}
                  className="ml-2 flex items-center"
                >
                  <X className="h-3 w-3 mr-1" />
                  <span className="text-xs">ลบสิทธิ์</span>
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
