
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { useAuth } from "@/components/AuthProvider";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { DeviceManagementView } from "@/components/DeviceManagementView";

export default function DeviceManagement() {
  const { user, userRoles, isLoading } = useAuth();
  const { toast } = useToast();
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [devices, setDevices] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [deviceUserMap, setDeviceUserMap] = useState<Record<string, string[]>>({});
  
  const isAdmin = userRoles.includes('admin') || userRoles.includes('superadmin');
  
  // Fetch all devices
  const fetchDevices = async () => {
    try {
      const { data: deviceData, error } = await supabase
        .from('rice_quality_analysis')
        .select('device_code')
        .not('device_code', 'is', null);
      
      if (error) throw error;
      
      // Extract unique device codes
      const uniqueDevices = Array.from(new Set(deviceData?.map(item => item.device_code)))
        .map(code => ({ device_code: code }));
      
      setDevices(uniqueDevices);
    } catch (error) {
      console.error("Error fetching devices:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลอุปกรณ์ได้",
        variant: "destructive",
      });
    }
  };
  
  // Fetch ALL users - updated to match the approach in UserManagement
  const fetchUsers = async () => {
    try {
      // Get all profiles instead of filtering by waiting_list
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email');
      
      if (profilesError) throw profilesError;
      
      // No filtering by waiting_list, show all users
      setUsers(profilesData || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลผู้ใช้ได้",
        variant: "destructive",
      });
    }
  };
  
  // Fetch device-user access mappings
  const fetchDeviceUserMappings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_device_access')
        .select('device_code, user_id');
      
      if (error) throw error;
      
      // Create a mapping of device_code to an array of user_ids
      const mappings: Record<string, string[]> = {};
      data?.forEach(item => {
        if (!mappings[item.device_code]) {
          mappings[item.device_code] = [];
        }
        mappings[item.device_code].push(item.user_id);
      });
      
      setDeviceUserMap(mappings);
    } catch (error) {
      console.error("Error fetching device-user mappings:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลการเข้าถึงอุปกรณ์ได้",
        variant: "destructive",
      });
    }
  };
  
  // Fetch all data
  const fetchAllData = async () => {
    setIsLoadingData(true);
    try {
      await Promise.all([
        fetchDevices(),
        fetchUsers(),
        fetchDeviceUserMappings()
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoadingData(false);
    }
  };
  
  useEffect(() => {
    if (user && isAdmin) {
      fetchAllData();
    }
  }, [user, isAdmin]);
  
  // If still loading, show loading indicator
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-emerald-50 to-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }
  
  // If user not logged in or doesn't have admin/superadmin role, redirect to login
  if (!user || !isAdmin) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64">
      <Header />
      <main className="flex-1 p-4 pb-28">
        <h1 className="text-2xl font-bold mb-6">จัดการอุปกรณ์และสิทธิ์การเข้าถึง</h1>
        
        <DeviceManagementView 
          devices={devices}
          users={users}
          deviceUserMap={deviceUserMap}
          isLoading={isLoadingData}
          onRefresh={fetchAllData}
        />
      </main>
      <FooterNav />
    </div>
  );
}
