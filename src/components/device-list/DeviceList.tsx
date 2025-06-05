
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ActivitySquare, Clock } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchDevicesWithDetails } from '@/features/equipment/services/deviceDataService';

interface DeviceData {
  device_code: string;
  updated_at: string;
  display_name?: string;
}

export const DeviceList = () => {
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userRoles } = useAuth();
  
  const isAdmin = userRoles.includes('admin');
  const isSuperAdmin = userRoles.includes('superadmin');
  
  useEffect(() => {
    const fetchDevices = async () => {
      if (!user) {
        setDevices([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        console.log('DeviceList: Fetching devices using optimized function...');
        
        // Use the new optimized function
        const deviceList = await fetchDevicesWithDetails(
          user.id,
          isAdmin,
          isSuperAdmin
        );
        
        // Transform to match expected interface
        const transformedDevices = deviceList.map(device => ({
          device_code: device.device_code,
          updated_at: device.updated_at || new Date().toISOString(),
          display_name: device.display_name
        }));
        
        console.log(`DeviceList: Fetched ${transformedDevices.length} devices in single query`);
        setDevices(transformedDevices);
        
      } catch (error) {
        console.error('DeviceList: Error fetching devices:', error);
        toast({
          title: 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
          description: 'ไม่สามารถโหลดรายการอุปกรณ์ได้ กรุณาลองใหม่อีกครั้ง',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDevices();
  }, [user, isAdmin, isSuperAdmin, toast]);
  
  // Format the date to be more readable
  const formatUpdatedAt = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { 
        addSuffix: true,
        locale: th
      });
    } catch (error) {
      return 'ไม่มีข้อมูล';
    }
  };
  
  const handleDeviceClick = (deviceCode: string) => {
    navigate(`/device/${deviceCode}`);
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((index) => (
          <Card key={index} className="cursor-pointer shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="p-4 flex justify-between items-center">
                <div>
                  <Skeleton className="h-6 w-36 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
              <div className="px-4 pb-4 flex items-center gap-2 text-xs text-gray-500">
                <Skeleton className="h-4 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {devices.length === 0 ? (
        <Card className="bg-gray-50 border-dashed">
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">ไม่พบข้อมูลอุปกรณ์</p>
          </CardContent>
        </Card>
      ) : (
        devices.map((device) => (
          <Card 
            key={device.device_code} 
            className="cursor-pointer shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-emerald-500" 
            onClick={() => handleDeviceClick(device.device_code)}
          >
            <CardContent className="p-0">
              <div className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-gray-800">
                    {device.display_name || device.device_code}
                  </h3>
                  {device.display_name && device.display_name !== device.device_code && (
                    <p className="text-xs text-gray-400">{device.device_code}</p>
                  )}
                  <p className="text-sm text-gray-500">อุปกรณ์วัดคุณภาพข้าว</p>
                </div>
                <div className="bg-emerald-100 p-2 rounded-full">
                  <ActivitySquare className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <div className="px-4 pb-4 flex items-center gap-2 text-xs text-gray-500">
                <Clock className="h-3.5 w-3.5" />
                <span>อัพเดทล่าสุด: {formatUpdatedAt(device.updated_at)}</span>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
