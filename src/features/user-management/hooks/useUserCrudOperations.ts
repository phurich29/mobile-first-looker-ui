
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase, supabaseAdmin } from "@/integrations/supabase/client";
import { User, NewUserFormValues, ResetPasswordFormValues } from "../types";
import { useAuth } from "@/components/AuthProvider";

type UserCrudOperationsProps = {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  isSuperAdmin: boolean;
  selectedUserId: string;
  setShowAddUserDialog: (show: boolean) => void;
  setShowResetPasswordDialog: (show: boolean) => void;
  setShowDeleteConfirm: (show: boolean) => void;
};

export function useUserCrudOperations({
  users,
  setUsers,
  isSuperAdmin,
  selectedUserId,
  setShowAddUserDialog,
  setShowResetPasswordDialog,
  setShowDeleteConfirm
}: UserCrudOperationsProps) {
  const { toast } = useToast();
  const { userRoles } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Create a new user
  const createUser = async (values: NewUserFormValues) => {
    setIsProcessing(true);
    try {
      // 1. Create user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password
      });
      
      if (authError) throw authError;
      
      if (!authData.user) {
        throw new Error("ไม่สามารถสร้างผู้ใช้ได้");
      }
      
      // ตรวจสอบว่าผู้ใช้ปัจจุบันเป็น admin หรือ superadmin หรือไม่
      const isAdminOrSuperAdmin = userRoles.includes('admin') || userRoles.includes('superadmin');
      
      // ถ้าเป็น admin หรือ superadmin ที่สร้างผู้ใช้ใหม่ ให้เพิ่มบทบาท 'user' โดยอัตโนมัติ
      if (isAdminOrSuperAdmin) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ 
            user_id: authData.user.id, 
            role: 'user'
          });

        if (roleError && roleError.code !== '23505') { // ข้ามกรณีที่มีบทบาทนี้อยู่แล้ว
          console.error('Error assigning user role:', roleError);
          // ไม่ throw error เพื่อให้โค้ดทำงานต่อไปได้
        }
      }
      
      toast({
        title: "สร้างผู้ใช้สำเร็จ",
        description: isAdminOrSuperAdmin 
          ? "ผู้ใช้ใหม่ถูกสร้างและเพิ่มเข้าสู่ระบบพร้อมใช้งานทันที" 
          : "ผู้ใช้ใหม่ถูกสร้างและเพิ่มเข้าสู่ waiting list รอการอนุมัติ",
      });
      
      // ปิด dialog และ reset form
      setShowAddUserDialog(false);
      
      // ถ้าเป็น admin หรือ superadmin ให้อยู่ที่หน้าเดิม (ไม่ต้องนำทางไปที่ waiting list)
      // นำทางกลับมาที่หน้าจัดการผู้ใช้เพื่อแน่ใจว่าไม่มีการนำทางไปที่อื่น
      if (isAdminOrSuperAdmin) {
        // นำทางกลับมาที่หน้าจัดการผู้ใช้อย่างชัดเจน
        navigate('/user-management');
      }
      
      // Refresh users list to include the new user
      const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
      
      if (authUsers?.users) {
        const usersWithRoles = await Promise.all(
          authUsers.users.map(async (authUser) => {
            const { data: roles } = await supabase.rpc(
              'get_user_roles',
              { user_id: authUser.id }
            );
            
            return {
              id: authUser.id,
              email: authUser.email || 'unknown@example.com',
              roles: roles || [],
              last_sign_in_at: authUser.last_sign_in_at
            };
          })
        );
        
        // Filter users based on current user's role
        let filteredUsers = usersWithRoles;
        
        // If user is not a superadmin, filter out superadmins from the list
        if (!isSuperAdmin) {
          filteredUsers = usersWithRoles.filter(user => !user.roles.includes('superadmin'));
        }
        
        setUsers(filteredUsers);
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      
      // Handle error messages
      let errorMessage = "ไม่สามารถสร้างผู้ใช้ได้ กรุณาลองใหม่อีกครั้ง";
      
      if (error.message.includes("user already registered")) {
        errorMessage = "อีเมลนี้มีผู้ใช้งานอยู่แล้ว";
      }
      
      toast({
        title: "สร้างผู้ใช้ไม่สำเร็จ",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset user password
  const resetUserPassword = async (values: ResetPasswordFormValues) => {
    // Prevent password reset for superadmin users by non-superadmins
    const targetUser = users.find(u => u.id === selectedUserId);
    if (!isSuperAdmin && targetUser?.roles.includes('superadmin')) {
      toast({
        title: "ไม่มีสิทธิ์",
        description: "ไม่สามารถรีเซ็ตรหัสผ่านของ Superadmin ได้",
        variant: "destructive",
      });
      setShowResetPasswordDialog(false);
      return;
    }

    setIsProcessing(true);
    
    try {
      if (!selectedUserId) throw new Error("ไม่พบรหัสผู้ใช้");
      
      // Reset password using admin API
      const { error } = await supabaseAdmin.auth.admin.updateUserById(
        selectedUserId,
        { password: values.password }
      );
      
      if (error) throw error;
      
      toast({
        title: "รีเซ็ตรหัสผ่านสำเร็จ",
        description: "รหัสผ่านถูกเปลี่ยนเรียบร้อยแล้ว",
      });
      
      setShowResetPasswordDialog(false);
    } catch (error: any) {
      console.error("Error resetting password:", error);
      
      toast({
        title: "รีเซ็ตรหัสผ่านไม่สำเร็จ",
        description: error.message || "เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete user
  const deleteUser = async () => {
    if (!selectedUserId) return;
    
    // Prevent deletion of superadmin users by non-superadmins
    const targetUser = users.find(u => u.id === selectedUserId);
    if (!isSuperAdmin && targetUser?.roles.includes('superadmin')) {
      toast({
        title: "ไม่มีสิทธิ์",
        description: "ไม่สามารถลบผู้ใช้ที่เป็น Superadmin ได้",
        variant: "destructive",
      });
      setShowDeleteConfirm(false);
      return;
    }
    
    setIsProcessing(true);
    try {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(selectedUserId);
      
      if (error) throw error;
      
      // Remove user from local state
      setUsers(users.filter(user => user.id !== selectedUserId));
      
      toast({
        title: "ลบผู้ใช้สำเร็จ",
        description: "ผู้ใช้ถูกลบออกจากระบบแล้ว",
      });
      
      setShowDeleteConfirm(false);
    } catch (error: any) {
      console.error("Error deleting user:", error);
      
      toast({
        title: "ลบผู้ใช้ไม่สำเร็จ",
        description: error.message || "เกิดข้อผิดพลาดในการลบผู้ใช้",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    createUser,
    resetUserPassword,
    deleteUser
  };
}
