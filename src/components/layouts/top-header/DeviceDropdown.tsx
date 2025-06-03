
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from 'react-router-dom';

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

  const handleDeviceSelect = (deviceCode: string) => {
    navigate(`/device/${deviceCode}`);
  };

  if (devices.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="text-white hover:bg-emerald-700/50 dark:hover:bg-slate-700/50 px-2 md:px-3 flex items-center h-auto md:h-10 text-xs md:text-sm"
          disabled={isLoadingDevices}
        >
          <span className="mr-1 md:mr-2">อุปกรณ์</span>
          <ChevronDown className="h-3 w-3 md:h-4 md:w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 max-h-60 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
      >
        {devices.map((device) => (
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
