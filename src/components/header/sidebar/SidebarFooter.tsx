
import { LogOut, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { useAuth } from "@/components/AuthProvider";

interface SidebarFooterProps {
  user: any | null;
  isCollapsed: boolean;
  isMobile: boolean;
}

export const SidebarFooter = ({ user, isCollapsed, isMobile }: SidebarFooterProps) => {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className={cn(
      "mt-auto",
      isCollapsed ? "pt-2" : "pt-4" // ลด padding เมื่อ sidebar หดตัว
    )}>
      {user && (
        <div className={cn(
          "border-t border-gray-200 dark:border-gray-700", 
          isCollapsed ? "pt-2" : "pt-4" // ลด padding เมื่อ sidebar หดตัว
        )}>
          {(isMobile || !isCollapsed) ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleLogout}
                  className={cn(
                    "flex items-center rounded-lg transition-colors text-red-600 hover:bg-red-50 hover:border hover:border-red-200 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:border-red-800",
                    isCollapsed ? "gap-2 py-2 px-1 justify-center" : "gap-3 py-2.5 px-3" // ปรับขนาดของปุ่มตามขนาดของ sidebar
                  )}
                >
                  <LogOut className="h-5 w-5" />
                  <span className="text-sm">ออกจากระบบ</span>
                </button>
              </div>
              <div className="flex items-center space-x-2">
                {/* Mobile only notifications link */}
                <Link 
                  to="/notifications" 
                  className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                >
                  <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </Link>
                <ThemeSwitcher />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2">
              <button 
                onClick={handleLogout}
                className="flex items-center justify-center h-7 w-7 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-800/30 transition-colors"
              >
                <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
              </button>
              <ThemeSwitcher />
            </div>
          )}
        </div>
      )}
      
      {!user && (
        <div className="flex justify-center mt-2">
          <ThemeSwitcher />
        </div>
      )}
    </div>
  );
};
