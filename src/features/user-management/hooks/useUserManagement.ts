
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase, supabaseAdmin } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { User, UserRole, NewUserFormValues, ResetPasswordFormValues } from "../types";
import { useAuth } from "@/components/AuthProvider";

export function useUserManagement() {
  const { toast } = useToast();
  const { user, userRoles } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(true);
  const [showAddUserDialog, setShowAddUserDialog] = useState<boolean>(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedUserEmail, setSelectedUserEmail] = useState<string>("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  // Check if current user is superadmin
  const isSuperAdmin = userRoles.includes('superadmin');

  // Fetch users and their roles
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user || (!userRoles.includes('admin') && !userRoles.includes('superadmin'))) {
        return;
      }

      try {
        setIsLoadingUsers(true);
        
        // Fetch all users with last sign in details
        const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (authError) {
          console.error("Auth users error:", authError);
          throw authError;
        }
        
        // For each user, fetch their roles
        const usersWithRoles = await Promise.all(
          (authUsers?.users || []).map(async (authUser) => {
            const { data: roles, error: rolesError } = await supabase.rpc(
              'get_user_roles',
              { user_id: authUser.id }
            );

            if (rolesError) {
              console.error('Error fetching roles for user:', authUser.id, rolesError);
            }
            
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
      } catch (error: any) {
        console.error('Error fetching users:', error.message);
        toast({
          title: "การโหลดข้อมูลผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลผู้ใช้ได้",
          variant: "destructive",
        });
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [user, userRoles, toast, isSuperAdmin]);

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
          role: 'user' as Database["public"]["Enums"]["app_role"]
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
          role: 'waiting_list' as Database["public"]["Enums"]["app_role"] 
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

  // Create a new user
  const createUser = async (values: NewUserFormValues) => {
    setIsProcessing(true);
    try {
      // 1. Create user with Supabase Admin API (to avoid auto-login)
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: values.email,
        password: values.password,
        email_confirm: true, // Automatically confirm email since we are admin
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
            role: 'user' as Database["public"]["Enums"]["app_role"]
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
  
  // Handle opening reset password dialog
  const handleOpenResetDialog = (userId: string, email: string) => {
    setSelectedUserId(userId);
    setSelectedUserEmail(email);
    setShowResetPasswordDialog(true);
  };
  
  // Handle opening delete confirm dialog
  const handleOpenDeleteDialog = (userId: string, email: string) => {
    setSelectedUserId(userId);
    setSelectedUserEmail(email);
    setShowDeleteConfirm(true);
  };

  return {
    users,
    setUsers, // Expose setUsers
    isLoadingUsers,
    isProcessing,
    isSuperAdmin,
    showAddUserDialog,
    setShowAddUserDialog,
    showResetPasswordDialog,
    setShowResetPasswordDialog,
    selectedUserId,
    selectedUserEmail,
    showDeleteConfirm,
    setShowDeleteConfirm,
    changeUserRole,
    approveUser,
    createUser,
    resetUserPassword,
    deleteUser,
    handleOpenResetDialog,
    handleOpenDeleteDialog,
  };
}
