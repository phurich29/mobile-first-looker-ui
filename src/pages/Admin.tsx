
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { EquipmentCard } from "@/components/EquipmentCard";
import { Settings, Users, Shield } from "lucide-react";

// Define types for our user and roles
interface User {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
}

interface UserWithRole extends User {
  roles: string[];
}

export default function Admin() {
  const { toast } = useToast();
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  
  // Check if user is logged in and get their roles
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        
        if (session?.user) {
          // Fetch user roles
          const { data: roles, error: rolesError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id);
          
          if (rolesError) throw rolesError;
          
          const userRolesList = roles.map(r => r.role);
          setUserRoles(userRolesList);
          
          // Only admins and superadmins can access this page
          if (!userRolesList.includes('admin') && !userRolesList.includes('superadmin')) {
            toast({
              title: "ไม่มีสิทธิ์เข้าถึง",
              description: "คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้",
              variant: "destructive",
            });
          }
        }
      } catch (error: any) {
        console.error('Error fetching session:', error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
  }, [toast]);
  
  // Fetch users (only for admins and superadmins)
  useEffect(() => {
    const fetchUsers = async () => {
      if (!session || (!userRoles.includes('admin') && !userRoles.includes('superadmin'))) {
        return;
      }
      
      try {
        // Fetch all profiles
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*');
        
        if (profilesError) throw profilesError;
        
        // Fetch all user roles
        const { data: allRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('*');
        
        if (rolesError) throw rolesError;
        
        // Combine profiles with their roles
        const usersWithRoles = profiles.map((profile: any) => {
          const userRoles = allRoles
            .filter((r: any) => r.user_id === profile.id)
            .map((r: any) => r.role);
          
          return {
            ...profile,
            roles: userRoles,
          };
        });
        
        setUsers(usersWithRoles);
      } catch (error: any) {
        console.error('Error fetching users:', error.message);
      }
    };
    
    fetchUsers();
  }, [session, userRoles]);
  
  // Fetch devices
  useEffect(() => {
    const fetchDevices = async () => {
      if (!session || (!userRoles.includes('admin') && !userRoles.includes('superadmin'))) {
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('device_settings')
          .select('*');
        
        if (error) throw error;
        setDevices(data || []);
      } catch (error: any) {
        console.error('Error fetching devices:', error.message);
      }
    };
    
    fetchDevices();
  }, [session, userRoles]);
  
  // Change user role (superadmin only)
  const changeUserRole = async (userId: string, newRole: string) => {
    if (!userRoles.includes('superadmin')) {
      toast({
        title: "ไม่มีสิทธิ์",
        description: "เฉพาะ Superadmin เท่านั้นที่สามารถเปลี่ยนบทบาทได้",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // First, check if user already has this role
      const { data: existingRole, error: checkError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', newRole);
      
      if (checkError) throw checkError;
      
      // If user doesn't have this role yet, add it
      if (!existingRole || existingRole.length === 0) {
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: newRole });
        
        if (insertError) throw insertError;
        
        toast({
          title: "เพิ่มบทบาทสำเร็จ",
          description: `เพิ่มบทบาท ${newRole} ให้ผู้ใช้สำเร็จ`,
        });
      } else {
        toast({
          title: "ผู้ใช้มีบทบาทนี้อยู่แล้ว",
          description: `ผู้ใช้มีบทบาท ${newRole} อยู่แล้ว`,
        });
      }
      
      // Refresh user list
      const { data: profiles } = await supabase.from('profiles').select('*');
      const { data: allRoles } = await supabase.from('user_roles').select('*');
      
      const updatedUsers = profiles.map((profile: any) => {
        const userRoles = allRoles
          .filter((r: any) => r.user_id === profile.id)
          .map((r: any) => r.role);
        
        return {
          ...profile,
          roles: userRoles,
        };
      });
      
      setUsers(updatedUsers);
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถเปลี่ยนบทบาทได้",
        variant: "destructive",
      });
    }
  };
  
  // Remove user role (superadmin only)
  const removeUserRole = async (userId: string, roleToRemove: string) => {
    if (!userRoles.includes('superadmin')) {
      toast({
        title: "ไม่มีสิทธิ์",
        description: "เฉพาะ Superadmin เท่านั้นที่สามารถลบบทบาทได้",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', roleToRemove);
      
      if (error) throw error;
      
      toast({
        title: "ลบบทบาทสำเร็จ",
        description: `ลบบทบาท ${roleToRemove} ออกจากผู้ใช้สำเร็จ`,
      });
      
      // Refresh user list
      const { data: profiles } = await supabase.from('profiles').select('*');
      const { data: allRoles } = await supabase.from('user_roles').select('*');
      
      const updatedUsers = profiles.map((profile: any) => {
        const userRoles = allRoles
          .filter((r: any) => r.user_id === profile.id)
          .map((r: any) => r.role);
        
        return {
          ...profile,
          roles: userRoles,
        };
      });
      
      setUsers(updatedUsers);
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถลบบทบาทได้",
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
  if (!session || (!userRoles.includes('admin') && !userRoles.includes('superadmin'))) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64">
      <Header />
      
      <main className="flex-1 p-4 pb-28">
        <h1 className="text-2xl font-bold mb-6">หน้าจัดการระบบ</h1>
        
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
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="border rounded-md p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{user.full_name || user.username || user.email}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
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
                          {!user.roles.includes('admin') && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => changeUserRole(user.id, 'admin')}
                            >
                              เพิ่มเป็น Admin
                            </Button>
                          )}
                          {user.roles.includes('admin') && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => removeUserRole(user.id, 'admin')}
                            >
                              ลบออกจาก Admin
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="devices">
            <Card>
              <CardHeader>
                <CardTitle>อุปกรณ์ทั้งหมด</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {devices.map((device) => (
                    <EquipmentCard 
                      key={device.id}
                      deviceCode={device.device_code}
                      lastUpdated={device.updated_at}
                    />
                  ))}
                </div>
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
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </main>
      
      {/* แถบนำทางด้านล่าง */}
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
          <div className="w-6 h-1 bg-emerald-600 rounded-full mx-auto mb-1"></div>
          <span className="text-xs text-emerald-600 font-medium">จัดการ</span>
        </a>
        <a href="/profile" className="flex flex-col items-center">
          <div className="w-6 h-1 bg-gray-300 rounded-full mx-auto mb-1"></div>
          <span className="text-xs text-gray-400">Profile</span>
        </a>
      </nav>
    </div>
  );
}
