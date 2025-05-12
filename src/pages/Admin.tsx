
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
import { useAuth } from "@/components/AuthProvider";

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
  
  // Fetch devices
  useEffect(() => {
    const fetchDevices = async () => {
      if (!user || (!userRoles.includes('admin') && !userRoles.includes('superadmin'))) {
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
  }, [user, userRoles]);
  
  // For demo purposes, create a list of sample users
  useEffect(() => {
    if (!userRoles.includes('admin') && !userRoles.includes('superadmin')) {
      return;
    }

    // Demo users (would normally come from a database)
    const mockUsers = [
      {
        id: '1',
        email: 'user@example.com',
        roles: ['user']
      },
      {
        id: '2',
        email: 'admin@example.com',
        roles: ['user', 'admin']
      },
      {
        id: '3',
        email: 'superadmin@example.com',
        roles: ['user', 'admin', 'superadmin']
      }
    ];

    // Add current user to the list if not already present
    if (user) {
      const currentUserInList = mockUsers.some(u => u.email === user.email);
      if (!currentUserInList) {
        mockUsers.push({
          id: user.id,
          email: user.email || 'unknown@example.com',
          roles: userRoles
        });
      }
    }

    setUsers(mockUsers);
  }, [user, userRoles]);
  
  // User management functions (demo only)
  const changeUserRole = (userId: string, newRole: string) => {
    if (!userRoles.includes('superadmin')) {
      toast({
        title: "ไม่มีสิทธิ์",
        description: "เฉพาะ Superadmin เท่านั้นที่สามารถเปลี่ยนบทบาทได้",
        variant: "destructive",
      });
      return;
    }
    
    // Update user roles in our mock data
    const updatedUsers = users.map(user => {
      if (user.id === userId && !user.roles.includes(newRole)) {
        return { ...user, roles: [...user.roles, newRole] };
      }
      return user;
    });
    
    setUsers(updatedUsers);
    
    toast({
      title: "เพิ่มบทบาทสำเร็จ",
      description: `เพิ่มบทบาท ${newRole} ให้ผู้ใช้สำเร็จ`,
    });
  };
  
  const removeUserRole = (userId: string, roleToRemove: string) => {
    if (!userRoles.includes('superadmin')) {
      toast({
        title: "ไม่มีสิทธิ์",
        description: "เฉพาะ Superadmin เท่านั้นที่สามารถลบบทบาทได้",
        variant: "destructive",
      });
      return;
    }
    
    // Remove role from our mock data
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        return { 
          ...user, 
          roles: user.roles.filter(role => role !== roleToRemove) 
        };
      }
      return user;
    });
    
    setUsers(updatedUsers);
    
    toast({
      title: "ลบบทบาทสำเร็จ",
      description: `ลบบทบาท ${roleToRemove} ออกจากผู้ใช้สำเร็จ`,
    });
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
