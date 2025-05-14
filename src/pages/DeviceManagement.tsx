
import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { useAuth } from "@/components/AuthProvider";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { DeviceManagementView } from "@/components/DeviceManagementView";

export default function DeviceManagement() {
  const { user, userRoles, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [devices, setDevices] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [deviceUserMap, setDeviceUserMap] = useState<Record<string, string[]>>({});
  
  const isAdmin = userRoles.includes('admin') || userRoles.includes('superadmin');
  
  // Improved function to fetch all unique devices
  const fetchDevices = useCallback(async () => {
    try {
      console.log('Fetching unique devices...');
      
      const { data, error } = await supabase
        .from('rice_quality_analysis')
        .select('device_code')
        .not('device_code', 'is', null);
      
      if (error) throw error;
      
      // Create a Set for unique device codes
      const uniqueDeviceCodes = new Set<string>();
      data?.forEach(item => {
        if (item.device_code) {
          uniqueDeviceCodes.add(item.device_code);
        }
      });
      
      // Convert to array format expected by the components
      const deviceList = Array.from(uniqueDeviceCodes).map(code => ({ device_code: code }));
      console.log(`Found ${deviceList.length} unique devices`);
      
      return deviceList;
    } catch (error) {
      console.error("Error fetching devices:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลอุปกรณ์ได้",
        variant: "destructive",
      });
      return [];
    }
  }, [toast]);
  
  // Improved function to fetch all users
  const fetchUsers = useCallback(async () => {
    try {
      console.log('Fetching users...');
      
      // Directly query profiles table instead of using potentially problematic RPC
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      console.log(`Found ${data?.length || 0} users`);
      return data || [];
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลผู้ใช้ได้",
        variant: "destructive",
      });
      return [];
    }
  }, [toast]);
  
  // Function to fetch device-user access mappings
  const fetchDeviceUserMappings = useCallback(async () => {
    try {
      console.log('Fetching device-user mappings...');
      
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
      
      console.log(`Processed device-user mappings for ${Object.keys(mappings).length} devices`);
      return mappings;
    } catch (error) {
      console.error("Error fetching device-user mappings:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลการเข้าถึงอุปกรณ์ได้",
        variant: "destructive",
      });
      return {};
    }
  }, [toast]);
  
  // Fetch all data with better error handling
  const fetchAllData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      console.log("Fetching all device management data...");
      
      // Use Promise.all for parallel fetching
      const [deviceList, userList, mappings] = await Promise.all([
        fetchDevices(),
        fetchUsers(),
        fetchDeviceUserMappings()
      ]);
      
      setDevices(deviceList);
      setUsers(userList);
      setDeviceUserMap(mappings);
      
      console.log("Successfully fetched all device management data");
      
      return {
        devices: deviceList,
        users: userList,
        deviceUserMap: mappings
      };
    } catch (error) {
      console.error("Error fetching all data:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลได้ครบถ้วน",
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  }, [fetchDevices, fetchUsers, fetchDeviceUserMappings, toast]);
  
  // Initial data loading
  useEffect(() => {
    if (user && isAdmin && !isAuthLoading) {
      fetchAllData();
    }
  }, [user, isAdmin, isAuthLoading, fetchAllData]);
  
  // If still loading auth, show loading indicator
  if (isAuthLoading) {
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
