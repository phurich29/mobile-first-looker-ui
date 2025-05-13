
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { FooterNav } from "@/components/FooterNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Shield, ChevronDown, UserPlus, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase, supabaseAdmin } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose 
} from "@/components/ui/dialog";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Define types for our user data
interface User {
  id: string;
  email: string;
  roles: string[];
  last_sign_in_at?: string | null;
}

// Schema for new user form
const newUserSchema = z.object({
  email: z.string().email("กรุณาใส่อีเมลที่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "รหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"]
});

// Schema for reset password form
const resetPasswordSchema = z.object({
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "รหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"]
});

export default function UserManagement() {
  const { toast } = useToast();
  const { user, userRoles, isLoading } = useAuth();
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

  const newUserForm = useForm<z.infer<typeof newUserSchema>>({
    resolver: zodResolver(newUserSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  const resetPasswordForm = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });

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
  const changeUserRole = async (userId: string, role: Database["public"]["Enums"]["app_role"], isAdding: boolean) => {
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
  const createUser = async (values: z.infer<typeof newUserSchema>) => {
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
      newUserForm.reset();
      
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
  const resetUserPassword = async (values: z.infer<typeof resetPasswordSchema>) => {
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
      resetPasswordForm.reset();
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
    resetPasswordForm.reset();
  };
  
  // Handle opening delete confirm dialog
  const handleOpenDeleteDialog = (userId: string, email: string) => {
    setSelectedUserId(userId);
    setSelectedUserEmail(email);
    setShowDeleteConfirm(true);
  };

  // Format date for display
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "ไม่เคยเข้าสู่ระบบ";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // If still loading, show loading indicator
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-emerald-50 to-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // If user not logged in or doesn't have admin role, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (!userRoles.includes('admin') && !userRoles.includes('superadmin')) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64">
      <Header />

      <main className="flex-1 p-4 pb-28">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-emerald-600" />
            <h1 className="text-2xl font-bold">จัดการผู้ใช้งาน</h1>
          </div>
          
          <Button 
            onClick={() => setShowAddUserDialog(true)}
            variant="default"
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            เพิ่มผู้ใช้ใหม่
          </Button>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="py-3">
            <CardTitle className="text-xl">รายชื่อผู้ใช้ทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingUsers ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">กำลังโหลดข้อมูลผู้ใช้...</p>
              </div>
            ) : users.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-2/3 py-1 text-xs">ข้อมูลผู้ใช้</TableHead>
                      <TableHead className="w-1/3 text-right py-1 text-xs">จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className={user.roles.includes('waiting_list') ? "bg-amber-50" : ""}>
                        <TableCell className="py-1">
                          <div className="space-y-1">
                            <div className="flex flex-col">
                              <span className="font-medium text-xs">{user.email}</span>
                              <span className="text-[10px] text-gray-500">
                                เข้าสู่ระบบล่าสุด: {formatDate(user.last_sign_in_at)}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {user.roles.length > 0 ? user.roles.map((role) => (
                                <Badge 
                                  key={role} 
                                  className={`text-[10px] px-1 py-0 ${
                                    role === 'superadmin' ? 'bg-red-100 text-red-800 hover:bg-red-200' : 
                                    role === 'admin' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 
                                    role === 'waiting_list' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' :
                                    'bg-green-100 text-green-800 hover:bg-green-200'
                                  }`}
                                  variant="outline"
                                >
                                  {role}
                                </Badge>
                              )) : (
                                <span className="text-gray-400 text-[10px] italic">ไม่มีสิทธิ์</span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-1 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            {user.roles.includes('waiting_list') && !user.roles.includes('user') && (
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => approveUser(user.id)}
                                disabled={isProcessing}
                                className="bg-emerald-600 hover:bg-emerald-700 text-[10px] h-6 px-1"
                              >
                                อนุมัติ
                              </Button>
                            )}
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenResetDialog(user.id, user.email)}
                              className="h-6 w-6 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDeleteDialog(user.id, user.email)}
                              className="text-red-500 hover:text-red-600 h-6 w-6 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" disabled={isProcessing} className="h-6 w-6 p-0">
                                  <ChevronDown className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                {!user.roles.includes('user') ? (
                                  <DropdownMenuItem onClick={() => changeUserRole(user.id, 'user', true)} className="text-[11px]">
                                    เพิ่มสิทธิ์ User
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => changeUserRole(user.id, 'user', false)} className="text-[11px]">
                                    ลบสิทธิ์ User
                                  </DropdownMenuItem>
                                )}
                                
                                {!user.roles.includes('admin') ? (
                                  <DropdownMenuItem onClick={() => changeUserRole(user.id, 'admin', true)} className="text-[11px]">
                                    เพิ่มสิทธิ์ Admin
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => changeUserRole(user.id, 'admin', false)} className="text-[11px]">
                                    ลบสิทธิ์ Admin
                                  </DropdownMenuItem>
                                )}
                                
                                {/* ถ้าเป็น superadmin จึงจะสามารถจัดการสิทธิ์ superadmin ได้ */}
                                {isSuperAdmin && !user.roles.includes('superadmin') ? (
                                  <DropdownMenuItem onClick={() => changeUserRole(user.id, 'superadmin', true)} className="text-[11px]">
                                    เพิ่มสิทธิ์ Superadmin
                                  </DropdownMenuItem>
                                ) : isSuperAdmin && user.roles.includes('superadmin') ? (
                                  <DropdownMenuItem onClick={() => changeUserRole(user.id, 'superadmin', false)} className="text-[11px]">
                                    ลบสิทธิ์ Superadmin
                                  </DropdownMenuItem>
                                ) : null}
                                
                                {!user.roles.includes('waiting_list') ? (
                                  <DropdownMenuItem onClick={() => changeUserRole(user.id, 'waiting_list', true)} className="text-[11px]">
                                    เพิ่มสถานะ Waiting List
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => changeUserRole(user.id, 'waiting_list', false)} className="text-[11px]">
                                    ลบสถานะ Waiting List
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500">ไม่พบข้อมูลผู้ใช้</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Dialog for adding a new user */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>เพิ่มผู้ใช้ใหม่</DialogTitle>
            <DialogDescription>
              กรอกข้อมูลผู้ใช้ใหม่เพื่อเพิ่มเข้าสู่ระบบ
            </DialogDescription>
          </DialogHeader>
          
          <Form {...newUserForm}>
            <form onSubmit={newUserForm.handleSubmit(createUser)} className="space-y-6">
              <FormField
                control={newUserForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>อีเมล</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="กรอกอีเมลผู้ใช้" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={newUserForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>รหัสผ่าน</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="กรอกรหัสผ่าน" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={newUserForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ยืนยันรหัสผ่าน</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="ยืนยันรหัสผ่าน" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" asChild>
                  <DialogClose>ยกเลิก</DialogClose>
                </Button>
                <Button type="submit" disabled={isProcessing}>
                  {isProcessing ? "กำลังสร้างผู้ใช้..." : "สร้างผู้ใช้"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog for resetting user password */}
      <Dialog open={showResetPasswordDialog} onOpenChange={setShowResetPasswordDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>เปลี่ยนรหัสผ่านผู้ใช้</DialogTitle>
            <DialogDescription>
              กำหนดรหัสผ่านใหม่สำหรับผู้ใช้ {selectedUserEmail}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...resetPasswordForm}>
            <form onSubmit={resetPasswordForm.handleSubmit(resetUserPassword)} className="space-y-6">
              <FormField
                control={resetPasswordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>รหัสผ่านใหม่</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="กำหนดรหัสผ่านใหม่" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={resetPasswordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ยืนยันรหัสผ่านใหม่</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="ยืนยันรหัสผ่านใหม่" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" asChild>
                  <DialogClose>ยกเลิก</DialogClose>
                </Button>
                <Button type="submit" disabled={isProcessing}>
                  {isProcessing ? "กำลังดำเนินการ..." : "เปลี่ยนรหัสผ่าน"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog for confirming user deletion */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>ยืนยันการลบผู้ใช้</DialogTitle>
            <DialogDescription>
              คุณต้องการลบผู้ใช้ {selectedUserEmail} ออกจากระบบใช่หรือไม่?
              การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button type="button" variant="outline" asChild>
              <DialogClose>ยกเลิก</DialogClose>
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={deleteUser} 
              disabled={isProcessing}
            >
              {isProcessing ? "กำลังลบ..." : "ลบผู้ใช้"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer Navigation */}
      <FooterNav />
    </div>
  );
}
