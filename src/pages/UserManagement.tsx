import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Shield, ChevronDown } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

// Define types for our user data
interface User {
  id: string;
  email: string;
  roles: string[];
}

export default function UserManagement() {
  const { toast } = useToast();
  const { user, userRoles, isLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Fetch users and their roles
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user || !userRoles.includes('superadmin')) {
        return;
      }

      try {
        console.log("Fetching users...");
        
        // Fetch all users from profiles table
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email');

        if (profilesError) {
          console.error("Profiles error:", profilesError);
          throw profilesError;
        }

        console.log("Profiles fetched:", profiles?.length || 0);

        // For each profile, fetch their roles
        const usersWithRoles = await Promise.all(
          (profiles || []).map(async (profile) => {
            console.log("Fetching roles for user:", profile.id);
            
            const { data: roles, error: rolesError } = await supabase.rpc(
              'get_user_roles',
              { user_id: profile.id }
            );

            if (rolesError) {
              console.error('Error fetching roles for user:', profile.id, rolesError);
            }

            console.log("Roles for user:", profile.id, roles);
            
            return {
              id: profile.id,
              email: profile.email || 'unknown@example.com',
              roles: roles || []
            };
          })
        );

        console.log("Users with roles processed:", usersWithRoles.length);
        setUsers(usersWithRoles);
      } catch (error: any) {
        console.error('Error fetching users:', error.message);
        toast({
          title: "การโหลดข้อมูลผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลผู้ใช้ได้",
          variant: "destructive",
        });
      }
    };

    fetchUsers();
  }, [user, userRoles, toast]);

  // Add or remove a role for a user
  const changeUserRole = async (userId: string, role: Database["public"]["Enums"]["app_role"], isAdding: boolean) => {
    if (!userRoles.includes('superadmin')) {
      toast({
        title: "ไม่มีสิทธิ์",
        description: "เฉพาะ Superadmin เท่านั้นที่สามารถเปลี่ยนบทบาทได้",
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
    if (!userRoles.includes('superadmin')) {
      toast({
        title: "ไม่มีสิทธิ์",
        description: "เฉพาะ Superadmin เท่านั้นที่สามารถอนุมัติผู้ใช้",
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

  // Initialize users with default roles if no roles are assigned
  const initializeUserRoles = async () => {
    if (!userRoles.includes('superadmin')) {
      toast({
        title: "ไม่มีสิทธิ์",
        description: "เฉพาะ Superadmin เท่านั้นที่สามารถจัดการสิทธิ์ได้",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const usersToUpdate = users.filter(u => u.roles.length === 0);
      
      if (usersToUpdate.length === 0) {
        toast({
          title: "ไม่มีการเปลี่ยนแปลง",
          description: "ผู้ใช้ทุกคนมีบทบาทกำหนดแล้ว",
        });
        return;
      }

      // For each user with no roles, assign 'user' role
      await Promise.all(
        usersToUpdate.map(async (u) => {
          const { error } = await supabase
            .from('user_roles')
            .insert({ 
              user_id: u.id, 
              role: 'user' as Database["public"]["Enums"]["app_role"]
            });
          
          if (error && error.code !== '23505') {  // Ignore duplicate entries
            throw error;
          }
        })
      );

      toast({
        title: "กำหนดสิทธิ์เริ่มต้นสำเร็จ",
        description: "ผู้ใช้ที่ไม่มีบทบาทได้รับสิทธิ์ 'user' แล้ว",
      });

      // Refresh the users list
      const updatedUsers = await Promise.all(
        users.map(async (user) => {
          if (user.roles.length === 0) {
            const { data: roles } = await supabase.rpc(
              'get_user_roles',
              { user_id: user.id }
            );
            return { ...user, roles: roles || [] };
          }
          return user;
        })
      );

      setUsers(updatedUsers);
    } catch (error: any) {
      console.error('Error initializing roles:', error.message);
      toast({
        title: "กำหนดสิทธิ์เริ่มต้นไม่สำเร็จ",
        description: error.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
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

  // If user not logged in or doesn't have superadmin role, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (!userRoles.includes('superadmin')) {
    return <Navigate to="/admin" />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64">
      <Header />

      <main className="flex-1 p-4 pb-28">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-emerald-600" />
            <h1 className="text-2xl font-bold">จัดการสิทธิ์ผู้ใช้</h1>
          </div>
          
          <Button 
            onClick={initializeUserRoles}
            variant="outline"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-emerald-600"></span>
                กำลังประมวลผล...
              </>
            ) : (
              'กำหนดสิทธิ์เริ่มต้น'
            )}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>รายชื่อผู้ใช้ทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            {users.length > 0 ? (
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
                            
                            {!user.roles.includes('superadmin') ? (
                              <DropdownMenuItem onClick={() => changeUserRole(user.id, 'superadmin', true)}>
                                เพิ่มสิทธิ์ Superadmin
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => changeUserRole(user.id, 'superadmin', false)}>
                                ลบสิทธิ์ Superadmin
                              </DropdownMenuItem>
                            )}
                            
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

      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-100 flex justify-around py-4 shadow-xl rounded-t-3xl backdrop-blur-sm bg-white/90" style={{ maxHeight: '80px' }}>
        <a href="/" className="flex flex-col items-center">
          <div className="w-6 h-1 bg-gray-300 rounded-full mx-auto mb-1"></div>
          <span className="text-xs text-gray-400">Home</span>
        </a>
        <a href="/market" className="flex flex-col items-center">
          <div className="w-6 h-1 bg-gray-300 rounded-full mx-auto mb-1"></div>
          <span className="text-xs text-gray-400">Market</span>
        </a>
        <a href="/admin" className="flex flex-col items-center">
          <div className="w-6 h-1 bg-gray-300 rounded-full mx-auto mb-1"></div>
          <span className="text-xs text-gray-400">จัดการ</span>
        </a>
        <a href="/user-management" className="flex flex-col items-center">
          <div className="w-6 h-1 bg-emerald-600 rounded-full mx-auto mb-1"></div>
          <span className="text-xs text-emerald-600 font-medium">จัดการสิทธิ์</span>
        </a>
      </nav>
    </div>
  );
}
