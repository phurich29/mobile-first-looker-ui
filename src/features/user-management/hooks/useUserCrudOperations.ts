
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { User, NewUserFormValues, ResetPasswordFormValues } from "../types";
import { useAuth } from "@/components/AuthProvider";
import * as userService from "../services/userService";

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
      // Use the service to create a user
      const newUser = await userService.createUser(values.email, values.password);
      
      // Check if current user is admin or superadmin
      const isAdminOrSuperAdmin = userRoles.includes('admin') || userRoles.includes('superadmin');
      
      // If admin or superadmin created the user, add 'user' role automatically
      if (isAdminOrSuperAdmin) {
        await userService.addDefaultRole(newUser.id, 'user');
      }
      
      toast({
        title: "สร้างผู้ใช้สำเร็จ",
        description: isAdminOrSuperAdmin 
          ? "ผู้ใช้ใหม่ถูกสร้างและเพิ่มเข้าสู่ระบบพร้อมใช้งานทันที" 
          : "ผู้ใช้ใหม่ถูกสร้างและเพิ่มเข้าสู่ waiting list รอการอนุมัติ",
      });
      
      // Close dialog
      setShowAddUserDialog(false);
      
      // If admin or superadmin, stay on the user management page
      if (isAdminOrSuperAdmin) {
        navigate('/user-management');
      }
      
      // Refresh users list
      const allUsers = await userService.fetchUsers();
      
      // Filter users based on current user's role
      let filteredUsers = allUsers;
      if (!isSuperAdmin) {
        filteredUsers = allUsers.filter(user => !user.roles.includes('superadmin'));
      }
      
      setUsers(filteredUsers);
    } catch (error: any) {
      console.error('Error creating user:', error);
      
      // Handle error messages
      let errorMessage = "ไม่สามารถสร้างผู้ใช้ได้ กรุณาลองใหม่อีกครั้ง";
      
      if (error.message?.includes("user already registered")) {
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
      
      // Use the service to reset password
      await userService.resetUserPassword(selectedUserId, values.password);
      
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
      // Use the service to delete user
      await userService.deleteUser(selectedUserId);
      
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
