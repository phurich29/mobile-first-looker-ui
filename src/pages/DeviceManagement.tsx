
import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layouts/app-layout"; // Import AppLayout
import { useIsMobile } from "@/hooks/use-mobile"; // Import useIsMobile
import { useAuth } from "@/components/AuthProvider";
// Header and FooterNav are handled by AppLayout
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { DeviceManagementView } from "@/components/DeviceManagementView";

export default function DeviceManagement() {
  const { user, userRoles, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [devices, setDevices] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [deviceUserMap, setDeviceUserMap] = useState<Record<string, string[]>>({});
  
  const isAdmin = userRoles.includes('admin') || userRoles.includes('superadmin');
  
  // Updated function to fetch devices using the same method as Equipment page
  const fetchDevices = useCallback(async () => {
    try {
      if (!user) return [];
      
      console.log('Fetching devices using direct query...');
      
      // Simplified query to get unique device codes with their latest data
      const { data, error } = await supabase
        .from('rice_quality_analysis')
        .select('device_code, created_at')
        .not('device_code', 'is', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching devices:", error);
        throw error;
      }

      // Process device data to get latest entry for each device
      const deviceMap = new Map<string, { device_code: string }>();
      data?.forEach(item => {
        if (item.device_code && !deviceMap.has(item.device_code)) {
          deviceMap.set(item.device_code, {
            device_code: item.device_code
          });
        }
      });
      
      console.log("Fetched unique devices:", deviceMap.size);
      return Array.from(deviceMap.values());
    } catch (error) {
      console.error("Error in fetchDevices:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลอุปกรณ์ได้",
        variant: "destructive",
      });
      return [];
    }
  }, [user, toast]);
  
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
    <AppLayout showFooterNav={true} contentPaddingBottom={isMobile ? 'pb-28' : 'pb-4'}>
      {/* Header and FooterNav are handled by AppLayout */}
      {/* The main content area. Background and min-height are handled by AppLayout or its children. */}
      {/* The md:ml-64 for sidebar is handled by AppLayout */}
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-6">จัดการอุปกรณ์และสิทธิ์การเข้าถึง</h1>
        
        <DeviceManagementView 
          devices={devices}
          users={users}
          deviceUserMap={deviceUserMap}
          isLoading={isLoadingData}
          onRefresh={fetchAllData}
        />
      </div>
    </AppLayout>
  );
}
