
import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { EquipmentCard } from "@/components/equipment/EquipmentCard";
import { Settings, Users, Shield } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { Database } from "@/integrations/supabase/types";
import { FooterNav } from "@/components/FooterNav";

// Define types for our user data
interface User {
  id: string;
  email: string;
  roles: string[];
}

export default function Admin() {
  const { toast } = useToast();
  const { user, userRoles, isLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [isFetchingUsers, setIsFetchingUsers] = useState<boolean>(false);
  const [isFetchingDevices, setIsFetchingDevices] = useState<boolean>(false);
  
  // Check if current user is superadmin
  const isSuperAdmin = userRoles.includes('superadmin');
  
  // Fetch users and their roles
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user || (!userRoles.includes('admin') && !userRoles.includes('superadmin'))) {
        return;
      }
      
      setIsFetchingUsers(true);
      try {
        // Fetch all users from profiles table
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email');
        
        if (profilesError) throw profilesError;
        
        // For each profile, fetch their roles
        const usersWithRoles = await Promise.all(
          (profiles || []).map(async (profile) => {
            const { data: roles, error: rolesError } = await supabase.rpc(
              'get_user_roles',
              { user_id: profile.id }
            );
            
            if (rolesError) console.error('Error fetching roles:', rolesError);
            
            return {
              id: profile.id,
              email: profile.email || 'unknown@example.com',
              roles: roles || []
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
        setIsFetchingUsers(false);
      }
    };
    
    fetchUsers();
  }, [user, userRoles, toast, isSuperAdmin]);
  
  // Fetch devices
  useEffect(() => {
    const fetchDevices = async () => {
      if (!user || (!userRoles.includes('admin') && !userRoles.includes('superadmin'))) {
        return;
      }
      
      setIsFetchingDevices(true);
      try {
        const { data, error } = await supabase
          .from('device_settings')
          .select('*');
        
        if (error) throw error;
        setDevices(data || []);
      } catch (error: any) {
        console.error('Error fetching devices:', error.message);
      } finally {
        setIsFetchingDevices(false);
      }
    };
    
    fetchDevices();
  }, [user, userRoles]);
  
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
  
  // If user not logged in or doesn't have admin/superadmin role, redirect to login
  if (!user || (!userRoles.includes('admin') && !userRoles.includes('superadmin'))) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64">
      <Header />
      
      <main className="flex-1 p-4 pb-28">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">หน้าจัดการระบบ</h1>
          
          {userRoles.includes('superadmin') && (
            <Link to="/user-management">
              <Button variant="outline" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                จัดการสิทธิ์ผู้ใช้
              </Button>
            </Link>
          )}
        </div>
        
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="users" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>ผู้ใช้งาน</span>
            </TabsTrigger>
            <TabsTrigger value="devices" className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              <span>อุปกรณ์</span>
            </TabsTrigger>
            {userRoles.includes('superadmin') && (
              <TabsTrigger value="roles" className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                <span>การจัดการสิทธิ์</span>
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>รายชื่อผู้ใช้งาน</CardTitle>
              </CardHeader>
              <CardContent>
                {isFetchingUsers ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users.length > 0 ? users.map((user) => (
                      <div key={user.id} className="border rounded-md p-4 flex justify-between items-center">
                        <div>
                          <p className="font-medium">{user.email}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {user.roles.map((role) => (
                              <span 
                                key={role} 
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  role === 'superadmin' ? 'bg-red-100 text-red-800' : 
                                  role === 'admin' ? 'bg-blue-100 text-blue-800' : 
                                  'bg-green-100 text-green-800'
                                }`}
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {userRoles.includes('superadmin') && (
                          <div className="flex gap-2">
                            <Link to="/user-management">
                              <Button 
                                size="sm" 
                                variant="outline"
                              >
                                จัดการสิทธิ์
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    )) : (
                      <p className="text-center text-gray-500">ไม่พบข้อมูลผู้ใช้</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="devices">
            <Card>
              <CardHeader>
                <CardTitle>อุปกรณ์ทั้งหมด</CardTitle>
              </CardHeader>
              <CardContent>
                {isFetchingDevices ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {devices.length > 0 ? devices.map((device) => (
                      <EquipmentCard 
                        key={device.id}
                        deviceCode={device.device_code}
                        lastUpdated={device.updated_at}
                      />
                    )) : (
                      <p className="text-center text-gray-500 col-span-3">ไม่พบข้อมูลอุปกรณ์</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {userRoles.includes('superadmin') && (
            <TabsContent value="roles">
              <Card>
                <CardHeader>
                  <CardTitle>การจัดการสิทธิ์</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-md p-4">
                      <h3 className="font-bold text-lg">ระดับสิทธิ์ในระบบ</h3>
                      <div className="mt-4 space-y-2">
                        <div className="bg-green-50 p-3 rounded-md border border-green-100">
                          <h4 className="font-medium">User</h4>
                          <p className="text-sm text-gray-600">สิทธิ์พื้นฐาน - สามารถดูข้อมูลได้เท่านั้น</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                          <h4 className="font-medium">Admin</h4>
                          <p className="text-sm text-gray-600">สิทธิ์ผู้ดูแลระบบ - สามารถจัดการข้อมูลและอุปกรณ์ได้</p>
                        </div>
                        <div className="bg-red-50 p-3 rounded-md border border-red-100">
                          <h4 className="font-medium">Superadmin</h4>
                          <p className="text-sm text-gray-600">สิทธิ์สูงสุด - สามารถจัดการทุกอย่างรวมถึงสิทธิ์ของผู้ใช้อื่น</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Link to="/user-management">
                        <Button variant="default">
                          ไปหน้าจัดการสิทธิ์
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </main>
      
      {/* แถบนำทางด้านล่าง */}
      <FooterNav />
    </div>
  );
}
