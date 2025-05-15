import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { EquipmentCard } from "@/components/EquipmentCard";
import { supabase, supabaseAdmin } from "@/integrations/supabase/client";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { FooterNav } from "@/components/FooterNav";
import { useAuth } from "@/components/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { DatabaseTable } from "@/components/DatabaseTable";

interface DeviceInfo {
  device_code: string;
  updated_at: string | null;
}

export default function Equipment() {
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [totalUniqueDevices, setTotalUniqueDevices] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { user, userRoles } = useAuth();
  
  const isAdmin = userRoles.includes('admin') || userRoles.includes('superadmin');
  const isSuperAdmin = userRoles.includes('superadmin');

  // Function to fetch ALL device data using direct query without limits 
  const fetchAllDevices = useCallback(async () => {
    try {
      if (!user) return [];

      console.log('Fetching devices for superadmin...');
      
      if (isSuperAdmin) {
        // For superadmin, fetch ALL unique devices with no limit
        const { data, error } = await supabaseAdmin
          .from('rice_quality_analysis')
          .select('device_code')
          .not('device_code', 'is', null)
          .not('device_code', 'eq', '');
          
        if (error) {
          console.error("Error fetching all devices:", error);
          throw error;
        }
        
        // Process to get unique devices with latest timestamp
        if (!data || data.length === 0) {
          console.log("No devices found");
          return [];
        }
        
        // Use Set to get unique device codes
        const uniqueDeviceCodes = new Set<string>();
        data.forEach(item => {
          if (item.device_code) {
            uniqueDeviceCodes.add(item.device_code);
          }
        });
        
        // Convert Set to array of device codes
        const deviceCodes = Array.from(uniqueDeviceCodes);
        console.log(`Found ${deviceCodes.length} unique device codes:`, deviceCodes);
        
        // For each unique device code, get the latest entry
        const devicePromises = deviceCodes.map(async (deviceCode) => {
          const { data: latestEntry, error: latestError } = await supabaseAdmin
            .from('rice_quality_analysis')
            .select('device_code, created_at')
            .eq('device_code', deviceCode)
            .order('created_at', { ascending: false })
            .limit(1);
            
          if (latestError) {
            console.error(`Error fetching latest data for device ${deviceCode}:`, latestError);
            return {
              device_code: deviceCode,
              updated_at: null
            };
          }
          
          return {
            device_code: deviceCode,
            updated_at: latestEntry && latestEntry.length > 0 ? latestEntry[0].created_at : null
          };
        });
        
        const deviceResults = await Promise.all(devicePromises);
        console.log(`Processed ${deviceResults.length} devices with timestamps:`, deviceResults);
        
        return deviceResults;
      } 
      // For regular users and admins, show only authorized devices
      else {
        console.log('Fetching authorized devices for user...');
        
        // Get devices that user has access to
        const { data: userDevices, error: userDevicesError } = await supabase
          .from('user_device_access')
          .select('device_code')
          .eq('user_id', user.id);

        if (userDevicesError) {
          console.error("Error fetching user device access:", userDevicesError);
          throw userDevicesError;
        }

        if (!userDevices || userDevices.length === 0) {
          console.log("User has no device access permissions.");
          return [];
        }

        // Get list of authorized device codes
        const authorizedDeviceCodes = userDevices.map(d => d.device_code);
        console.log("Authorized device codes:", authorizedDeviceCodes);
        
        // Get data for authorized devices
        const { data: deviceData, error: deviceError } = await supabase
          .from('rice_quality_analysis')
          .select('device_code, created_at')
          .in('device_code', authorizedDeviceCodes)
          .order('created_at', { ascending: false });

        if (deviceError) {
          console.error("Error fetching authorized devices:", deviceError);
          throw deviceError;
        }

        // Process to get unique devices
        const deviceMap = new Map<string, DeviceInfo>();
        deviceData?.forEach(item => {
          if (item.device_code && !deviceMap.has(item.device_code)) {
            deviceMap.set(item.device_code, {
              device_code: item.device_code,
              updated_at: item.created_at
            });
          }
        });

        console.log("Fetched authorized devices for user:", deviceMap.size);
        return Array.from(deviceMap.values());
      }
    } catch (error) {
      console.error("Error in fetchAllDevices:", error);
      throw error;
    }
  }, [user, userRoles, isSuperAdmin]);

  // Count total unique devices (for superadmin only)
  const getUniqueDevicesCount = useCallback(async () => {
    try {
      if (!user || !isSuperAdmin) return 0;
      
      console.log('Counting unique devices...');
      
      // Fetch all device codes from rice_quality_analysis
      const { data, error } = await supabaseAdmin
        .from('rice_quality_analysis')
        .select('device_code')
        .not('device_code', 'is', null)
        .not('device_code', 'eq', '');
        
      if (error) {
        console.error("Error counting unique devices:", error);
        return 0;
      }
      
      // Get unique device codes
      const uniqueDeviceCodes = new Set();
      data?.forEach(item => {
        if (item.device_code) {
          uniqueDeviceCodes.add(item.device_code);
        }
      });
      
      const count = uniqueDeviceCodes.size;
      console.log(`Found ${count} unique devices`);
      return count;
    } catch (error) {
      console.error("Unexpected error counting devices:", error);
      return 0;
    }
  }, [user, isSuperAdmin]);

  // Use React Query for data fetching
  const { 
    data: deviceData,
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['devices', user?.id, userRoles],
    queryFn: fetchAllDevices,
    enabled: !!user,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      console.error('Device query error:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลอุปกรณ์ได้",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Update devices state when data changes
  useEffect(() => {
    if (deviceData) {
      setDevices(deviceData);
    }
  }, [deviceData]);

  // Fetch total count on initial load (for superadmin only)
  useEffect(() => {
    if (user && isSuperAdmin) {
      getUniqueDevicesCount().then(setTotalUniqueDevices);
    }
  }, [user, isSuperAdmin, getUniqueDevicesCount]);

  // Handle refresh - Using comprehensive approach to ensure all devices are fetched
  const handleRefresh = async () => {
    try {
      console.log("Refreshing device data...");
      setIsRefreshing(true);
      
      // For superadmins, use the direct query approach to ensure ALL devices are fetched
      if (isSuperAdmin) {
        // Get ALL unique device codes from rice_quality_analysis
        const { data: allDevicesData, error: allDevicesError } = await supabaseAdmin
          .from('rice_quality_analysis')
          .select('device_code')
          .not('device_code', 'is', null)
          .not('device_code', 'eq', '');
          
        if (allDevicesError) {
          throw allDevicesError;
        }
        
        if (!allDevicesData || allDevicesData.length === 0) {
          console.log("No devices found in refresh");
          setDevices([]);
          return;
        }
        
        // Get unique device codes
        const uniqueDeviceCodes = new Set<string>();
        allDevicesData.forEach(item => {
          if (item.device_code) {
            uniqueDeviceCodes.add(item.device_code);
          }
        });
        
        // For each unique device code, get the latest entry
        const deviceCodes = Array.from(uniqueDeviceCodes);
        const devicePromises = deviceCodes.map(async (deviceCode) => {
          const { data: latestEntry, error: latestError } = await supabaseAdmin
            .from('rice_quality_analysis')
            .select('device_code, created_at')
            .eq('device_code', deviceCode)
            .order('created_at', { ascending: false })
            .limit(1);
            
          if (latestError) {
            console.error(`Error refreshing data for device ${deviceCode}:`, latestError);
            return {
              device_code: deviceCode,
              updated_at: null
            };
          }
          
          return {
            device_code: deviceCode,
            updated_at: latestEntry && latestEntry.length > 0 ? latestEntry[0].created_at : null
          };
        });
        
        const deviceResults = await Promise.all(devicePromises);
        console.log(`Refresh found ${deviceResults.length} unique devices with timestamps`);
        
        setDevices(deviceResults);
        
        // Update count for superadmin
        const count = uniqueDeviceCodes.size;
        setTotalUniqueDevices(count);
        
        toast({
          title: "อัพเดทข้อมูลสำเร็จ",
          description: `พบ ${deviceResults.length} อุปกรณ์ทั้งหมด`,
        });
        
        return;
      } 
      
      // For non-superadmin users, use the regular refetch
      await refetch();
      
      toast({
        title: "อัพเดทข้อมูลสำเร็จ",
        description: devices.length > 0 
          ? `พบ ${devices.length} อุปกรณ์ที่คุณมีสิทธิ์เข้าถึง` 
          : "ไม่พบอุปกรณ์ที่คุณมีสิทธิ์เข้าถึง",
      });
      
    } catch (error) {
      console.error("Refresh error:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัพเดทข้อมูลได้",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64">
      <Header />
      <main className="flex-1 p-4 pb-32 md:pb-16 md:mx-auto md:max-w-5xl md:px-8 w-full">
        {/* Devices Section */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>อุปกรณ์</h1>
            {isSuperAdmin && totalUniqueDevices > 0 && (
              <p className="text-xs text-gray-500 mt-1">จำนวนอุปกรณ์ทั้งหมดในระบบ: {totalUniqueDevices} เครื่อง</p>
            )}
            {!isSuperAdmin && (
              <p className="text-xs text-gray-500 mt-1">แสดงเฉพาะอุปกรณ์ที่คุณได้รับสิทธิ์การเข้าถึง</p>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1 border-emerald-200 bg-white hover:bg-emerald-50"
            onClick={handleRefresh} 
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-xs">รีเฟรช</span>
          </Button>
        </div>
        
        {devices.length === 0 ? (
          <div className="bg-white p-6 rounded-xl text-center shadow-sm">
            {isLoading ? (
              <p className="text-gray-500 text-sm">กำลังดึงข้อมูลอุปกรณ์...</p>
            ) : isSuperAdmin ? (
              <p className="text-gray-500 text-sm">ไม่พบอุปกรณ์ กรุณากดปุ่มรีเฟรชเพื่อค้นหาอุปกรณ์</p>
            ) : (
              <p className="text-gray-500 text-sm">
                คุณยังไม่ได้รับสิทธิ์ให้เข้าถึงอุปกรณ์ใดๆ กรุณาติดต่อ Super Admin เพื่อขอสิทธิ์การเข้าถึง
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mt-4 md:grid-cols-3 lg:grid-cols-4">
            {devices.map((device) => (
              <EquipmentCard
                key={device.device_code}
                deviceCode={device.device_code}
                lastUpdated={device.updated_at}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
        
        {/* Database Table Section - Only visible to admins and superadmins */}
        {isAdmin && <DatabaseTable />}
      </main>

      <FooterNav />
    </div>
  );
}
