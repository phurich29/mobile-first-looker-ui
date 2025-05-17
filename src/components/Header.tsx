import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bell, Menu, User, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { HeaderClock } from "./HeaderClock";
import { HeaderMainContent } from "./HeaderMainContent";
import { ActiveDeviceIndicator } from "./ActiveDeviceIndicator";

export const Header = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  useEffect(() => {
    // Get sidebar collapsed state from localStorage
    const savedCollapsedState = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsedState) {
      setIsSidebarCollapsed(savedCollapsedState === 'true');
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
    
    // Dispatch a custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('sidebarStateChanged', { detail: { isCollapsed: newState } }));
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "ออกจากระบบสำเร็จ",
      description: "คุณได้ออกจากระบบเรียบร้อยแล้ว",
    });
  };

  const handleNotificationClick = () => {
    // Mock notification data
    const mockNotifications = [
      { id: 1, message: 'อุปกรณ์ A มีค่าความชื้นสูง', time: '10 นาทีที่แล้ว' },
      { id: 2, message: 'อุปกรณ์ B ต้องการการบำรุงรักษา', time: '30 นาทีที่แล้ว' },
    ];
    setNotifications(mockNotifications);
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800 backdrop-blur-lg">
      <div className="flex h-16 justify-between items-center px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <HeaderMainContent />
        </div>
        
        <div className="flex items-center gap-4">
          <ActiveDeviceIndicator className="hidden md:flex" />
          <HeaderClock />
          <div className="relative">
            <button
              onClick={handleNotificationClick}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 relative"
            >
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              {notifications.length > 0 && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              )}
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-md z-10">
                <div className="py-2">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div key={notification.id} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        {notification.message}
                        <div className="text-xs text-gray-500 dark:text-gray-400">{notification.time}</div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">ไม่มีการแจ้งเตือน</div>
                  )}
                </div>
              </div>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full overflow-hidden border-2 border-transparent hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name || "User Avatar"} />
                  <AvatarFallback>{user?.user_metadata?.full_name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mr-2">
              <DropdownMenuLabel>บัญชีผู้ใช้</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled className="cursor-default">
                {user?.email}
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="cursor-default">
                {user?.user_metadata?.full_name || "ชื่อผู้ใช้"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>ออกจากระบบ</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
