
import { CheckCircle, X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "../../types";
import { toggleUserDeviceAccess } from "../../services/userAccessService";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UserAccessListProps {
  deviceCode: string;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setAllUsers: React.Dispatch<React.SetStateAction<User[]>>;
  isLoading: boolean;
}

interface UserWithRole extends User {
  roles: string[];
  hasImplicitAccess: boolean;
}

export function UserAccessList({
  deviceCode,
  users,
  setUsers,
  setAllUsers,
  isLoading
}: UserAccessListProps) {
  const { toast } = useToast();
  const [usersWithRoles, setUsersWithRoles] = useState<UserWithRole[]>([]);
  
  // Fetch user roles when users change
  useEffect(() => {
    const fetchUserRoles = async () => {
      if (users.length === 0) {
        setUsersWithRoles([]);
        return;
      }
      
      try {
        const userIds = users.map(u => u.id);
        const { data: userRoles, error } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .in('user_id', userIds);
          
        if (error) {
          console.error("Error fetching user roles:", error);
          return;
        }
        
        // Group roles by user
        const roleMap = new Map<string, string[]>();
        userRoles?.forEach(ur => {
          if (!roleMap.has(ur.user_id)) {
            roleMap.set(ur.user_id, []);
          }
          roleMap.get(ur.user_id)?.push(ur.role);
        });
        
        // Combine users with their roles
        const usersWithRoleData: UserWithRole[] = users.map(user => {
          const roles = roleMap.get(user.id) || [];
          const hasImplicitAccess = roles.includes('admin') || roles.includes('superadmin');
          
          return {
            ...user,
            roles,
            hasImplicitAccess
          };
        });
        
        setUsersWithRoles(usersWithRoleData);
      } catch (error) {
        console.error("Error fetching user roles:", error);
      }
    };
    
    fetchUserRoles();
  }, [users]);
  
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
  const usersWithAccess = usersWithRoles.filter(user => user.hasAccess);
  
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
            ยังไม่มีผู้ใช้ที่มีสิทธิ์เข้าถึงอุปกรณ์นี้ (แสดงตามสิทธิ์ของคุณ)
          </div>
        ) : (
          usersWithAccess.map((user) => (
            <div key={user.id} className="p-3 flex justify-between items-center">
              <div className="truncate flex-1">
                <div className="text-sm font-medium truncate">
                  {user.email}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="text-xs text-green-600">
                    มีสิทธิ์เข้าถึง
                  </div>
                  {user.hasImplicitAccess && (
                    <div className="flex items-center gap-1 text-xs text-blue-600">
                      <Shield className="h-3 w-3" />
                      <span>
                        {user.roles.includes('superadmin') ? 'Super Admin' : 'Admin'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {user.hasImplicitAccess ? (
                <div className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
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
