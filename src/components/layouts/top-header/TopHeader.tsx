import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { MobileMenuButton } from './MobileMenuButton';
import { HeaderLogo } from './HeaderLogo';
import { DeviceDropdown } from './DeviceDropdown';
import { useDeviceData } from './useDeviceData';

interface TopHeaderProps {
  isMobile: boolean;
  isCollapsed: boolean;
  setSidebarOpen: (open: boolean) => void;
  pageTitle?: string;
  logoSrc?: string;
  logoAlt?: string;
  appName?: string;
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
  const { user } = useAuth();
  const { devices, isLoadingDevices } = useDeviceData();

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-16 items-center justify-between left-0 right-0',
        'bg-emerald-600 text-white',
        'shadow-lg dark:bg-emerald-800',
        'transition-all duration-300 ease-in-out',
        'px-4',
        isMobile ? '' : (isCollapsed ? 'md:pl-[100px]' : 'md:pl-[276px]'),
        isMobile ? '' : 'md:pr-6'
      )}
    >
      {/* Left Section */}
      <div className="flex items-center gap-3">
        {isMobile && (
          <MobileMenuButton setSidebarOpen={setSidebarOpen} />
        )}
        {/* Page Title or Logo */}
        {isMobile ? (
          <HeaderLogo 
            logoSrc={logoSrc}
            logoAlt={logoAlt}
            appName={appName}
          />
        ) : (
          <h1 className="text-lg font-semibold truncate">
            {pageTitle}
          </h1>
        )}
      </div>

      {/* Right Section */}
      <div className="flex flex-row items-center gap-3">
        {/* Device Dropdown */}
        {user && (
          <DeviceDropdown 
            devices={devices}
            isLoadingDevices={isLoadingDevices}
          />
        )}
        
        <Button variant="ghost" size="icon" className="text-white hover:bg-emerald-700/50 dark:hover:bg-emerald-700/50">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};
