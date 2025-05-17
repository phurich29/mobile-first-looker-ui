import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ActivitySquare, Calendar, Clock, Pin, PinOff } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeviceContext } from '@/contexts/DeviceContext';
import { Button } from '@/components/ui/button';

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
  const { user } = useAuth();
  const { selectedDevice, setSelectedDevice } = useDeviceContext();
  
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);
        
        // First check user device access if user is logged in
        if (user) {
          const { data: accessData, error: accessError } = await supabase
            .from('user_device_access')
            .select('device_code')
            .eq('user_id', user.id);
            
          if (accessError) {
            throw new Error(accessError.message);
          }
          
          // If user has specific device access
          if (accessData && accessData.length > 0) {
            // Get the latest data for user's accessible devices
            const { data, error } = await supabase
              .rpc('get_device_data');
            
            if (error) {
              throw new Error(error.message);
            }
            
            // Filter only the devices user has access to
            const accessibleDeviceCodes = accessData.map(access => access.device_code);
            const filteredDevices = data?.filter(device => 
              accessibleDeviceCodes.includes(device.device_code)
            );
            
            // Fetch device display names
            const deviceCodes = filteredDevices?.map(device => device.device_code) || [];
            
            if (deviceCodes.length > 0) {
              const { data: settingsData } = await supabase
                .from('device_settings')
                .select('device_code, display_name')
                .in('device_code', deviceCodes);
              
              // Merge display names with device data
              const devicesWithNames = filteredDevices?.map(device => {
                const settings = settingsData?.find(s => s.device_code === device.device_code);
                return {
                  ...device,
                  display_name: settings?.display_name
                };
              });
              
              setDevices(devicesWithNames || []);
            } else {
              setDevices(filteredDevices || []);
            }
            return;
          }
        }
        
        // If no user or user has no specific access, fetch all device data
        const { data, error } = await supabase
          .rpc('get_device_data');
        
        if (error) {
          throw new Error(error.message);
        }
        
        // Fetch device display names
        const deviceCodes = data?.map(device => device.device_code) || [];
        
        if (deviceCodes.length > 0) {
          const { data: settingsData } = await supabase
            .from('device_settings')
            .select('device_code, display_name')
            .in('device_code', deviceCodes);
          
          // Merge display names with device data
          const devicesWithNames = data?.map(device => {
            const settings = settingsData?.find(s => s.device_code === device.device_code);
            return {
              ...device,
              display_name: settings?.display_name
            };
          });
          
          setDevices(devicesWithNames || []);
        } else {
          setDevices(data || []);
        }
      } catch (error) {
        console.error('Error fetching devices:', error);
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
  }, [user, toast]);
  
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

  const handlePinDevice = async (e: React.MouseEvent, deviceCode: string) => {
    e.stopPropagation(); // Prevent navigation to device details
    
    // If this device is already selected, unpin it
    if (selectedDevice === deviceCode) {
      await setSelectedDevice(null);
    } else {
      // Otherwise pin this device
      await setSelectedDevice(deviceCode);
    }
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
      {user && selectedDevice && (
        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Pin className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
            <span className="text-sm text-blue-700 dark:text-blue-300">
              โหมดแสดงเฉพาะอุปกรณ์ที่เลือก
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedDevice(null)}
            className="text-xs"
          >
            <PinOff className="h-3 w-3 mr-1" />
            ยกเลิก
          </Button>
        </div>
      )}

      {devices.length === 0 ? (
        <Card className="bg-gray-50 border-dashed">
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">ไม่พบข้อมูลอุปกรณ์</p>
          </CardContent>
        </Card>
      ) : (
        // Show only selected device when in device focus mode
        (user && selectedDevice ? devices.filter(device => device.device_code === selectedDevice) : devices).map((device) => {
          const isSelected = device.device_code === selectedDevice;
          
          return (
            <Card 
              key={device.device_code} 
              className={`cursor-pointer shadow-sm hover:shadow-md transition-shadow border-l-4 ${
                isSelected ? 'border-l-blue-500' : 'border-l-emerald-500'
              }`} 
              onClick={() => handleDeviceClick(device.device_code)}
            >
              <CardContent className="p-0">
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-800">
                      {device.display_name || device.device_code}
                    </h3>
                    {device.display_name && (
                      <p className="text-xs text-gray-500">รหัส: {device.device_code}</p>
                    )}
                    <p className="text-sm text-gray-500">อุปกรณ์วัดคุณภาพข้าว</p>
                  </div>
                  <div className="flex items-center">
                    {user && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`mr-2 ${isSelected ? 'text-blue-500' : 'text-gray-400'}`}
                        onClick={(e) => handlePinDevice(e, device.device_code)}
                        title={isSelected ? "ยกเลิกการปักหมุด" : "ปักหมุดเพื่อแสดงเฉพาะอุปกรณ์นี้"}
                      >
                        {isSelected ? <Pin className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                      </Button>
                    )}
                    <div className={`p-2 rounded-full ${isSelected ? 'bg-blue-100' : 'bg-emerald-100'}`}>
                      <ActivitySquare className={`h-6 w-6 ${isSelected ? 'text-blue-600' : 'text-emerald-600'}`} />
                    </div>
                  </div>
                </div>
                <div className="px-4 pb-4 flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="h-3.5 w-3.5" />
                  <span>อัพเดทล่าสุด: {formatUpdatedAt(device.updated_at)}</span>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};
