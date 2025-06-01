import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu, Bell, Sun, Moon, Clock } from 'lucide-react'; // Added Clock, UserCircle was already removed

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

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second

    return () => {
      clearInterval(timerId); // Cleanup interval on component unmount
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleanup on unmount

  const formattedTime = currentTime.toLocaleTimeString(navigator.language, { // Use browser's locale for formatting
    hour: '2-digit',
    minute: '2-digit',
    // second: '2-digit', // Uncomment to show seconds
  });

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
      <div className="flex flex-col items-end md:flex-row md:items-center gap-1 md:gap-3">
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
