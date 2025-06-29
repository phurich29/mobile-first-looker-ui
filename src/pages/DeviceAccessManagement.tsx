
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layouts/app-layout";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Loader2, Users, Monitor } from "lucide-react";

interface User {
  id: string;
  email: string;
}

interface Device {
  device_code: string;
  display_name?: string;
}

interface AccessMapping {
  [deviceCode: string]: string[]; // array of user IDs
}

export default function DeviceAccessManagement() {
  const { user, userRoles, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [accessMapping, setAccessMapping] = useState<AccessMapping>({});
  const [isLoading, setIsLoading] = useState(true);
  
  const isSuperAdmin = userRoles.includes('superadmin');

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email')
        .order('email');
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลผู้ใช้ได้",
        variant: "destructive",
      });
    }
  };

  // Fetch all devices
  const fetchDevices = async () => {
    try {
      // Get unique device codes from rice_quality_analysis
      const { data: analysisData, error: analysisError } = await supabase
        .from('rice_quality_analysis')
        .select('device_code')
        .not('device_code', 'is', null);
      
      if (analysisError) throw analysisError;

      // Get device settings for display names
      const { data: settingsData, error: settingsError } = await supabase
        .from('device_settings')
        .select('device_code, display_name');
      
      if (settingsError) throw settingsError;

      // Create unique device list
      const uniqueDeviceCodes = [...new Set(analysisData?.map(d => d.device_code) || [])];
      const deviceList = uniqueDeviceCodes.map(code => {
        const setting = settingsData?.find(s => s.device_code === code);
        return {
          device_code: code,
          display_name: setting?.display_name
        };
      });

      setDevices(deviceList);
    } catch (error) {
      console.error('Error fetching devices:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลอุปกรณ์ได้",
        variant: "destructive",
      });
    }
  };

  // Fetch access mappings
  const fetchAccessMappings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_device_access')
        .select('device_code, user_id');
      
      if (error) throw error;

      const mappings: AccessMapping = {};
      data?.forEach(access => {
        if (!mappings[access.device_code]) {
          mappings[access.device_code] = [];
        }
        mappings[access.device_code].push(access.user_id);
      });

      setAccessMapping(mappings);
    } catch (error) {
      console.error('Error fetching access mappings:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลการเข้าถึงได้",
        variant: "destructive",
      });
    }
  };

  // Load all data
  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchUsers(),
      fetchDevices(),
      fetchAccessMappings()
    ]);
    setIsLoading(false);
  };

  // Toggle user access to device
  const toggleAccess = async (userId: string, deviceCode: string, hasAccess: boolean) => {
    try {
      if (hasAccess) {
        // Remove access
        const { error } = await supabase
          .from('user_device_access')
          .delete()
          .eq('user_id', userId)
          .eq('device_code', deviceCode);
        
        if (error) throw error;

        // Update local state
        setAccessMapping(prev => ({
          ...prev,
          [deviceCode]: prev[deviceCode]?.filter(id => id !== userId) || []
        }));

        toast({
          title: "ลบสิทธิ์สำเร็จ",
          description: "ลบสิทธิ์การเข้าถึงอุปกรณ์เรียบร้อยแล้ว",
        });
      } else {
        // Grant access
        const { error } = await supabase
          .from('user_device_access')
          .insert({
            user_id: userId,
            device_code: deviceCode,
            created_by: user?.id
          });
        
        if (error) throw error;

        // Update local state
        setAccessMapping(prev => ({
          ...prev,
          [deviceCode]: [...(prev[deviceCode] || []), userId]
        }));

        toast({
          title: "เพิ่มสิทธิ์สำเร็จ",
          description: "เพิ่มสิทธิ์การเข้าถึงอุปกรณ์เรียบร้อยแล้ว",
        });
      }
    } catch (error) {
      console.error('Error toggling access:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถจัดการสิทธิ์ได้",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user && isSuperAdmin && !isAuthLoading) {
      loadData();
    }
  }, [user, isSuperAdmin, isAuthLoading]);

  // Check auth and permissions
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-emerald-50 to-gray-50">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || !isSuperAdmin) {
    return <Navigate to="/login" />;
  }

  return (
    <AppLayout showFooterNav={true}>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Monitor className="h-6 w-6" />
          <h1 className="text-2xl font-bold">จัดการสิทธิ์การเข้าถึงอุปกรณ์</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-6">
            {devices.map(device => (
              <Card key={device.device_code}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div>
                      <span className="text-lg">
                        {device.display_name || device.device_code}
                      </span>
                      {device.display_name && (
                        <span className="text-sm text-gray-500 ml-2">
                          ({device.device_code})
                        </span>
                      )}
                    </div>
                    <Badge variant="outline">
                      <Users className="h-3 w-3 mr-1" />
                      {accessMapping[device.device_code]?.length || 0} ผู้ใช้
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {users.map(user => {
                      const hasAccess = accessMapping[device.device_code]?.includes(user.id) || false;
                      return (
                        <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <span className="font-medium">{user.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={hasAccess}
                              onCheckedChange={() => toggleAccess(user.id, device.device_code, hasAccess)}
                            />
                            <span className="text-sm text-gray-500 w-16">
                              {hasAccess ? 'มีสิทธิ์' : 'ไม่มีสิทธิ์'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex justify-center">
          <Button onClick={loadData} variant="outline">
            <Loader2 className="h-4 w-4 mr-2" />
            รีเฟรชข้อมูล
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
