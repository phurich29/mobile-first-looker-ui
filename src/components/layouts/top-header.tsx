
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu, Bell, Sun, Moon, Clock, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

interface TopHeaderProps {
  isMobile: boolean;
  isCollapsed: boolean;
  // eslint-disable-next-line no-unused-vars
  setSidebarOpen: (open: boolean) => void; // For mobile menu toggle
  pageTitle?: string; // Optional: if we pass page title directly
  logoSrc?: string;   // Optional: path to logo image
  logoAlt?: string;   // Optional: alt text for logo
  appName?: string;   // Optional: application name displayed with logo
}

interface Device {
  device_code: string;
  display_name?: string;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  isMobile,
  isCollapsed,
  setSidebarOpen,
  pageTitle = 'หน้าหลัก',
  logoSrc = "/lovable-uploads/649554cd-4d80-484a-995d-e49f2721a07d.png",
  logoAlt = "RiceFlow Logo",
  appName = "RiceFlow",
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const navigate = useNavigate();
  const { user, userRoles } = useAuth();

  const isAdmin = userRoles.includes('admin');
  const isSuperAdmin = userRoles.includes('superadmin');

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second

    return () => {
      clearInterval(timerId); // Cleanup interval on component unmount
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleanup on unmount

  // Fetch devices for the dropdown
  useEffect(() => {
    const fetchDevices = async () => {
      if (!user) return;
      
      setIsLoadingDevices(true);
      try {
        let query = supabase
          .from('rice_quality_analysis')
          .select('device_code')
          .not('device_code', 'is', null)
          .order('created_at', { ascending: false });

        // If not superadmin, filter by user access
        if (!isSuperAdmin) {
          if (isAdmin) {
            // Admin can see all devices
          } else {
            // Regular users see only authorized devices
            const { data: userDevices } = await supabase
              .from('user_device_access')
              .select('device_code')
              .eq('user_id', user.id);
            
            if (userDevices && userDevices.length > 0) {
              const deviceCodes = userDevices.map(d => d.device_code);
              query = query.in('device_code', deviceCodes);
            } else {
              // No access to any devices
              setDevices([]);
              return;
            }
          }
        }

        const { data, error } = await query;

        if (error) throw error;

        // Get unique device codes
        const uniqueDevices = Array.from(
          new Set(data?.map(item => item.device_code))
        ).map(device_code => ({ device_code }));

        // Fetch display names for devices
        if (uniqueDevices.length > 0) {
          const deviceCodes = uniqueDevices.map(d => d.device_code);
          const { data: settingsData } = await supabase
            .from('device_settings')
            .select('device_code, display_name')
            .in('device_code', deviceCodes);

          // Merge display names
          const devicesWithNames = uniqueDevices.map(device => {
            const setting = settingsData?.find(s => s.device_code === device.device_code);
            return {
              ...device,
              display_name: setting?.display_name || device.device_code
            };
          });

          setDevices(devicesWithNames);
        }
      } catch (error) {
        console.error('Error fetching devices:', error);
      } finally {
        setIsLoadingDevices(false);
      }
    };

    fetchDevices();
  }, [user, isAdmin, isSuperAdmin]);

  const formattedTime = currentTime.toLocaleTimeString(navigator.language, { // Use browser's locale for formatting
    hour: '2-digit',
    minute: '2-digit',
    // second: '2-digit', // Uncomment to show seconds
  });

  const handleDeviceSelect = (deviceCode: string) => {
    navigate(`/device/${deviceCode}`);
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-16 items-center justify-between left-0 right-0', // Ensure full width
        'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white',
        'shadow-lg dark:from-slate-800 dark:to-slate-900',
        'transition-all duration-300 ease-in-out',
        // Dynamic padding based on sidebar state:
        'px-4', // Base horizontal padding for mobile and fallback
        isMobile ? '' : (isCollapsed ? 'md:pl-[100px]' : 'md:pl-[276px]'), // Desktop left padding (original + 20px), overrides pl-4 from px-4
        isMobile ? '' : 'md:pr-6' // Desktop right padding, overrides pr-4 from px-4
      )}
    >
      {/* Left Section */}
      <div className="flex items-center gap-3">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-emerald-700/50 dark:hover:bg-slate-700/50 -ml-2"
            onClick={() => setSidebarOpen(true)} // Assuming true opens mobile sidebar
          >
            <Menu className="h-6 w-6" />
          </Button>
        )}
        {/* Page Title or Logo */}
        {isMobile ? (
          <div className="flex items-center gap-2">
            <img src={logoSrc} alt={logoAlt} className="h-8 w-auto rounded-full" />
            <span className="text-lg font-semibold text-white">{appName}</span>
          </div>
        ) : (
          <h1 className="text-lg font-semibold truncate">
            {pageTitle}
          </h1>
        )}
      </div>

      {/* Right Section */}
      <div className="flex flex-row items-center gap-3">
        {/* Device Dropdown */}
        {user && devices.length > 0 && (
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
        )}

        <Button 
          variant="ghost" 
          className="text-white hover:bg-emerald-700/50 dark:hover:bg-slate-700/50 px-1 md:px-2 flex items-center h-auto md:h-10"
          // No onClick action needed for time display
        >
          <Clock className="h-3 w-3 md:h-5 md:w-5 mr-1 md:mr-1.5" /> 
          <span className="text-xs md:text-sm">{formattedTime}</span>
        </Button>
        <Button variant="ghost" size="icon" className="text-white hover:bg-emerald-700/50 dark:hover:bg-slate-700/50">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};
