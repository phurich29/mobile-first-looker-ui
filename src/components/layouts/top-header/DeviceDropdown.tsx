
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useUnifiedPermissions } from '@/hooks/useUnifiedPermissions';
import { supabase } from '@/integrations/supabase/client';

interface Device {
  device_code: string;
  display_name?: string;
}

interface DeviceDropdownProps {
  devices: Device[];
  isLoadingDevices: boolean;
}

export const DeviceDropdown: React.FC<DeviceDropdownProps> = ({
  devices,
  isLoadingDevices
}) => {
  const navigate = useNavigate();
  const { deviceCode: deviceCodeFromUrl } = useParams<{ deviceCode?: string }>();
  const location = useLocation();
  const { isAuthenticated } = useUnifiedPermissions();
  const [selectedDeviceName, setSelectedDeviceName] = useState<string>("เลือกอุปกรณ์");

  // เลือกใช้ devices ที่เหมาะสม - เฉพาะ authenticated users
  const displayDevices = devices;
  const isLoading = isLoadingDevices;

  useEffect(() => {
    if (isLoading) {
      setSelectedDeviceName("กำลังโหลด...");
      return;
    }

    if (displayDevices.length === 0) {
      setSelectedDeviceName("ไม่มีอุปกรณ์"); 
      return;
    }

    if (deviceCodeFromUrl) {
      const currentDevice = displayDevices.find(d => d.device_code === deviceCodeFromUrl);
      if (currentDevice) {
        setSelectedDeviceName(currentDevice.display_name || currentDevice.device_code);
      } else {
        setSelectedDeviceName("เลือกอุปกรณ์");
      }
    } else {
      setSelectedDeviceName("เลือกอุปกรณ์");
    }
  }, [deviceCodeFromUrl, displayDevices, isLoading]);

  const handleDeviceSelect = (newDeviceCode: string) => {
    const currentPathname = location.pathname;

    if (deviceCodeFromUrl && currentPathname.startsWith(`/device/${deviceCodeFromUrl}`)) {
      const basePathSegment = `/device/${deviceCodeFromUrl}`;
      if (currentPathname === basePathSegment) {
        navigate(`/device/${newDeviceCode}`);
      } else if (currentPathname.startsWith(basePathSegment + '/')) {
        const remainingPath = currentPathname.substring(basePathSegment.length);
        navigate(`/device/${newDeviceCode}${remainingPath}`);
      } else {
        navigate(`/device/${newDeviceCode}`);
      }
    } else {
      navigate(`/device/${newDeviceCode}`);
    }
  };

  if (!isLoading && displayDevices.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="text-white hover:bg-emerald-700/50 dark:hover:bg-slate-700/50 px-2 md:px-3 flex items-center h-auto md:h-10 text-xs md:text-sm"
          disabled={isLoading}
        >
          <span className="mr-1 md:mr-2 truncate max-w-[100px] xs:max-w-[120px] sm:max-w-[150px] md:max-w-[180px] lg:max-w-[200px]">
            {selectedDeviceName}
          </span>
          <ChevronDown className="h-3 w-3 md:h-4 md:w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 max-h-60 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
      >
        {displayDevices.map((device) => (
          <DropdownMenuItem
            key={device.device_code}
            onClick={() => handleDeviceSelect(device.device_code)}
            className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <div className="flex flex-col">
              <span className="font-medium">{device.display_name}</span>
              {device.display_name !== device.device_code && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {device.device_code}
                </span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
