
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Shield, ChevronDown, UserPlus } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
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

export default function UserManagement() {
  const { toast } = useToast();
  const { user, userRoles, isLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(true);
  const [showAddUserDialog, setShowAddUserDialog] = useState<boolean>(false);

  const form = useForm<z.infer<typeof newUserSchema>>({
    resolver: zodResolver(newUserSchema),
    defaultValues: {
      email: "",
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
        
        // Fetch all users from profiles table
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email');

        if (profilesError) {
          console.error("Profiles error:", profilesError);
          throw profilesError;
        }

        // For each profile, fetch their roles
        const usersWithRoles = await Promise.all(
          (profiles || []).map(async (profile) => {
            const { data: roles, error: rolesError } = await supabase.rpc(
              'get_user_roles',
              { user_id: profile.id }
            );

            if (rolesError) {
              console.error('Error fetching roles for user:', profile.id, rolesError);
            }
            
            return {
              id: profile.id,
              email: profile.email || 'unknown@example.com',
              roles: roles || []
            };
          })
        );

        setUsers(usersWithRoles);
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
  }, [user, userRoles, toast]);

  // Add or remove a role for a user
  const changeUserRole = async (userId: string, role: Database["public"]["Enums"]["app_role"], isAdding: boolean) => {
    // ป้องกันการแก้ไขสิทธิ์ superadmin โดย admin
    if (role === 'superadmin' && !userRoles.includes('superadmin')) {
      toast({
        title: "ไม่มีสิทธิ์",
        description: "เฉพาะ Superadmin เท่านั้นที่สามารถจัดการสิทธิ์ Superadmin",
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
      
      setUsers(updatedUsers);
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
      
      setUsers(updatedUsers);
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
      
      toast({
        title: "สร้างผู้ใช้สำเร็จ",
        description: "ผู้ใช้ใหม่ถูกสร้างและเพิ่มเข้าสู่ระบบแล้ว",
      });
      
      // ปิด dialog และ reset form
      setShowAddUserDialog(false);
      form.reset();
      
      // Refresh users list to include the new user
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email');
      
      if (profiles) {
        const usersWithRoles = await Promise.all(
          profiles.map(async (profile) => {
            const { data: roles } = await supabase.rpc(
              'get_user_roles',
              { user_id: profile.id }
            );
            
            return {
              id: profile.id,
              email: profile.email || 'unknown@example.com',
              roles: roles || []
            };
          })
        );
        
        setUsers(usersWithRoles);
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

  // Check if user is superadmin
  const isSuperAdmin = userRoles.includes('superadmin');

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

        <Card>
          <CardHeader>
            <CardTitle>รายชื่อผู้ใช้ทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingUsers ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">กำลังโหลดข้อมูลผู้ใช้...</p>
              </div>
            ) : users.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>อีเมล</TableHead>
                    <TableHead>บทบาทปัจจุบัน</TableHead>
                    <TableHead className="text-right">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className={user.roles.includes('waiting_list') ? "bg-amber-50" : ""}>
                      <TableCell>
                        <div className="font-medium">{user.email}</div>
                        {user.roles.includes('waiting_list') && !user.roles.includes('user') && (
                          <span className="text-xs text-amber-600 font-medium">รอการอนุมัติ</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.length > 0 ? user.roles.map((role) => (
                            <Badge 
                              key={role} 
                              className={
                                role === 'superadmin' ? 'bg-red-100 text-red-800 hover:bg-red-200' : 
                                role === 'admin' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 
                                role === 'waiting_list' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' :
                                'bg-green-100 text-green-800 hover:bg-green-200'
                              }
                              variant="outline"
                            >
                              {role}
                            </Badge>
                          )) : (
                            <span className="text-gray-400 text-sm italic">ไม่มีสิทธิ์</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {user.roles.includes('waiting_list') && !user.roles.includes('user') && (
                          <Button 
                            variant="default" 
                            size="sm" 
                            onClick={() => approveUser(user.id)}
                            disabled={isProcessing}
                            className="bg-emerald-600 hover:bg-emerald-700 mr-2"
                          >
                            {isProcessing ? "กำลังอนุมัติ..." : "อนุมัติ"}
                          </Button>
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" disabled={isProcessing}>
                              {isProcessing ? (
                                <>
                                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current"></span>
                                  กำลังดำเนินการ
                                </>
                              ) : (
                                <>จัดการสิทธิ์ <ChevronDown className="ml-1 h-4 w-4" /></>
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {!user.roles.includes('user') ? (
                              <DropdownMenuItem onClick={() => changeUserRole(user.id, 'user', true)}>
                                เพิ่มสิทธิ์ User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => changeUserRole(user.id, 'user', false)}>
                                ลบสิทธิ์ User
                              </DropdownMenuItem>
                            )}
                            
                            {!user.roles.includes('admin') ? (
                              <DropdownMenuItem onClick={() => changeUserRole(user.id, 'admin', true)}>
                                เพิ่มสิทธิ์ Admin
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => changeUserRole(user.id, 'admin', false)}>
                                ลบสิทธิ์ Admin
                              </DropdownMenuItem>
                            )}
                            
                            {/* ถ้าเป็น superadmin จึงจะสามารถจัดการสิทธิ์ superadmin ได้ */}
                            {isSuperAdmin && !user.roles.includes('superadmin') ? (
                              <DropdownMenuItem onClick={() => changeUserRole(user.id, 'superadmin', true)}>
                                เพิ่มสิทธิ์ Superadmin
                              </DropdownMenuItem>
                            ) : isSuperAdmin && user.roles.includes('superadmin') ? (
                              <DropdownMenuItem onClick={() => changeUserRole(user.id, 'superadmin', false)}>
                                ลบสิทธิ์ Superadmin
                              </DropdownMenuItem>
                            ) : null}
                            
                            {!user.roles.includes('waiting_list') ? (
                              <DropdownMenuItem onClick={() => changeUserRole(user.id, 'waiting_list', true)}>
                                เพิ่มสถานะ Waiting List
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => changeUserRole(user.id, 'waiting_list', false)}>
                                ลบสถานะ Waiting List
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(createUser)} className="space-y-6">
              <FormField
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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

      {/* Bottom nav */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-100 flex justify-around py-4 shadow-xl rounded-t-3xl backdrop-blur-sm bg-white/90" style={{ maxHeight: '80px' }}>
        <a href="/" className="flex flex-col items-center">
          <div className="w-6 h-1 bg-gray-300 rounded-full mx-auto mb-1"></div>
          <span className="text-xs text-gray-400">Home</span>
        </a>
        <a href="/rice-prices" className="flex flex-col items-center">
          <div className="w-6 h-1 bg-gray-300 rounded-full mx-auto mb-1"></div>
          <span className="text-xs text-gray-400">Market</span>
        </a>
        <a href="/admin" className="flex flex-col items-center">
          <div className="w-6 h-1 bg-gray-300 rounded-full mx-auto mb-1"></div>
          <span className="text-xs text-gray-400">จัดการ</span>
        </a>
        <a href="/user-management" className="flex flex-col items-center">
          <div className="w-6 h-1 bg-emerald-600 rounded-full mx-auto mb-1"></div>
          <span className="text-xs text-emerald-600 font-medium">จัดการผู้ใช้</span>
        </a>
      </nav>
    </div>
  );
}
