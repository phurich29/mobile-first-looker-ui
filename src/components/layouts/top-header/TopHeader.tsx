
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { useGuestMode } from '@/hooks/useGuestMode';
import { MobileMenuButton } from './MobileMenuButton';
import { HeaderLogo } from './HeaderLogo';
import { DeviceDropdown } from './DeviceDropdown';
import { UserProfileButton } from './UserProfileButton';
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
  const { isGuest } = useGuestMode();
  const { devices, isLoadingDevices } = useDeviceData();
  const navigate = useNavigate();

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-16 items-center justify-between left-0 right-0',
        'bg-emerald-600 text-white',
        'shadow-lg dark:bg-emerald-800',
        'transition-all duration-300 ease-in-out',
        'px-4',
        isMobile ? 'pt-safe-top' : '',
        isMobile ? '' : (isCollapsed ? 'md:pl-[100px]' : 'md:pl-[276px]'),
        isMobile ? '' : 'md:pr-6'
      )}
      style={isMobile ? { paddingTop: 'max(env(safe-area-inset-top), 1rem)' } : undefined}
    >
      {/* Left Section */}
      <div className="flex items-center gap-3">
        {isMobile && (
          <MobileMenuButton setSidebarOpen={setSidebarOpen} />
        )}
        {/* Page Title or Logo */}
        {isMobile ? (
          <HeaderLogo 
            appName={appName}
          />
        ) : (
          <HeaderLogo 
            appName={appName}
          />
        )}
      </div>

      {/* Right Section */}
      <div className="flex flex-row items-center gap-3">
        {/* Device Dropdown - แสดงสำหรับทั้ง user ที่ login และ guest */}
        {(user || isGuest) && (
          <DeviceDropdown 
            devices={devices}
            isLoadingDevices={isLoadingDevices}
          />
        )}
        
        {/* Notification Bell - แสดงเฉพาะ user ที่ login แล้ว */}
        {user && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-emerald-700/50 dark:hover:bg-emerald-700/50"
            onClick={() => navigate('/notifications')}
          >
            <Bell className="h-5 w-5" />
          </Button>
        )}

        {/* User Profile Button - แสดงสำหรับทั้ง user และ guest */}
        <UserProfileButton />
      </div>
      {user && !isGuest && (
        <div className="absolute bottom-0.5 right-4 text-[8px] text-white font-medium pointer-events-none truncate max-w-[150px]">
          {user.user_metadata?.full_name || user.email}
        </div>
      )}
    </header>
  );
};
