
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole } from "../types";

type UserRoleOperationsProps = {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  isSuperAdmin: boolean;
  userRoles: string[];
};

export function useUserRoleOperations({
  users,
  setUsers,
  isSuperAdmin,
  userRoles
}: UserRoleOperationsProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Add or remove a role for a user
  const changeUserRole = async (userId: string, role: UserRole, isAdding: boolean) => {
    // Prevent non-superadmin from changing superadmin role
    if (role === 'superadmin' && !userRoles.includes('superadmin')) {
      toast({
        title: "ไม่มีสิทธิ์",
        description: "เฉพาะ Superadmin เท่านั้นที่สามารถจัดการสิทธิ์ Superadmin",
        variant: "destructive",
      });
      return;
    }

    // Prevent modification of users with superadmin role by non-superadmins
    const targetUser = users.find(u => u.id === userId);
    if (!isSuperAdmin && targetUser?.roles.includes('superadmin')) {
      toast({
        title: "ไม่มีสิทธิ์",
        description: "ไม่สามารถแก้ไขสิทธิ์ของผู้ใช้ที่เป็น Superadmin ได้",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      if (isAdding) {
        // Add the role
        const { error } = await supabase
          .from('user_roles')
          .insert({ 
            user_id: userId, 
            role: role 
          });
        
        if (error) {
          if (error.code === '23505') { // Unique violation - role already exists
            toast({
              title: "บทบาทซ้ำ",
              description: `ผู้ใช้มีบทบาท ${role} อยู่แล้ว`,
              variant: "destructive",
            });
            return;
          }
          throw error;
        }
        
        toast({
          title: "เพิ่มบทบาทสำเร็จ",
          description: `เพิ่มบทบาท ${role} ให้ผู้ใช้สำเร็จ`,
        });
      } else {
        // Remove the role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .match({ user_id: userId, role: role });
        
        if (error) throw error;
        
        toast({
          title: "ลบบทบาทสำเร็จ",
          description: `ลบบทบาท ${role} ออกจากผู้ใช้สำเร็จ`,
        });
      }
      
      // Refresh the users list
      const updatedUsers = await Promise.all(
        users.map(async (user) => {
          if (user.id === userId) {
            const { data: roles } = await supabase.rpc(
              'get_user_roles',
              { user_id: userId }
            );
            return { ...user, roles: roles || [] };
          }
          return user;
        })
      );
      
      // Re-apply filtering for non-superadmins
      let filteredUsers = updatedUsers;
      if (!isSuperAdmin) {
        filteredUsers = updatedUsers.filter(user => !user.roles.includes('superadmin'));
      }
      
      setUsers(filteredUsers);
    } catch (error: any) {
      console.error('Error changing role:', error.message);
      toast({
        title: "เปลี่ยนบทบาทไม่สำเร็จ",
        description: error.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Approve a user from waiting list (add 'user' role and remove 'waiting_list')
  const approveUser = async (userId: string) => {
    // Prevent approval of users with superadmin role by non-superadmins
    const targetUser = users.find(u => u.id === userId);
    if (!isSuperAdmin && targetUser?.roles.includes('superadmin')) {
      toast({
        title: "ไม่มีสิทธิ์",
        description: "ไม่สามารถอนุมัติผู้ใช้ที่เป็น Superadmin ได้",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // First, add the 'user' role
      const { error: addError } = await supabase
        .from('user_roles')
        .insert({ 
          user_id: userId, 
          role: 'user' 
        });

      if (addError && addError.code !== '23505') { // Ignore duplicate key errors
        throw addError;
      }
      
      // Then remove the 'waiting_list' role
      const { error: removeError } = await supabase
        .from('user_roles')
        .delete()
        .match({ 
          user_id: userId, 
          role: 'waiting_list'
        });

      if (removeError) throw removeError;
      
      toast({
        title: "อนุมัติผู้ใช้สำเร็จ",
        description: "ผู้ใช้ได้รับการอนุมัติและสามารถใช้งานระบบได้แล้ว",
      });
      
      // Refresh the users list
      const updatedUsers = await Promise.all(
        users.map(async (user) => {
          if (user.id === userId) {
            const { data: roles } = await supabase.rpc(
              'get_user_roles',
              { user_id: userId }
            );
            return { ...user, roles: roles || [] };
          }
          return user;
        })
      );
      
      // Re-apply filtering for non-superadmins
      let filteredUsers = updatedUsers;
      if (!isSuperAdmin) {
        filteredUsers = updatedUsers.filter(user => !user.roles.includes('superadmin'));
      }
      
      setUsers(filteredUsers);
    } catch (error: any) {
      console.error('Error approving user:', error.message);
      toast({
        title: "อนุมัติผู้ใช้ไม่สำเร็จ",
        description: error.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    changeUserRole,
    approveUser
  };
}
