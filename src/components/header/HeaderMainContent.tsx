
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { HeaderClock } from "./HeaderClock";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface HeaderMainContentProps {
  setSidebarOpen: (open: boolean) => void;
  isCollapsed?: boolean;
}

export const HeaderMainContent = ({ setSidebarOpen, isCollapsed = false }: HeaderMainContentProps) => {
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isCollapsed);
  
  // Track isCollapsed prop changes
  useEffect(() => {
    setSidebarCollapsed(isCollapsed);
  }, [isCollapsed]);
  
  // Track sidebarStateChanged event from HeaderSidebar
  useEffect(() => {
    const handleSidebarStateChange = (e: CustomEvent) => {
      setSidebarCollapsed(e.detail.isCollapsed);
    };
    
    window.addEventListener('sidebarStateChanged', handleSidebarStateChange as EventListener);
    
    return () => {
      window.removeEventListener('sidebarStateChanged', handleSidebarStateChange as EventListener);
    };
  }, []);
  
  // For mobile, use separate state
  const handleMobileMenuClick = () => {
    if (isMobile) {
      const newState = !mobileMenuOpen;
      setMobileMenuOpen(newState);
      setSidebarOpen(newState);
    }
  };
  
  return (
    <header className={cn(
      "sticky top-0 z-20 flex items-center justify-between bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg dark:from-slate-800 dark:to-slate-900 py-5 px-4 md:px-8 md:py-6 transition-all duration-300 ease-in-out",
      // Use full width for mobile, adjust for desktop based on sidebar state
      isMobile ? "w-full left-0" : "w-full", 
      !isMobile && (sidebarCollapsed ? "ml-20" : "ml-64")
    )}>
      {/* Mobile Menu and Logo Group */}
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white p-1 hover:bg-emerald-600/70 dark:hover:bg-slate-700/70 md:hidden" 
          onClick={handleMobileMenuClick}
        >
          <Menu className="h-5 w-5 text-white" />
        </Button>
        
        {/* Add RiceFlow Logo in header */}
        <div className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/649554cd-4d80-484a-995d-e49f2721a07d.png" 
            alt="RiceFlow Logo" 
            className="h-10 w-10 rounded-full border-2 border-white/70 shadow-md" 
          />
          <span className="font-bold text-lg text-white hidden md:block">RiceFlow</span>
        </div>
      </div>

      {/* Digital Clock */}
      <HeaderClock />
    
      <div className="flex items-center gap-2">
        {/* Theme switcher - only visible on desktop */}
        {!isMobile && (
          <ThemeSwitcher />
        )}
        
        {/* Bell notification link */}
        <Link to="/notifications" className="bg-white/20 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center hover:bg-white/30 transition-colors shadow-inner dark:bg-slate-700/50 dark:hover:bg-slate-700/70">
          <Bell className="h-5 w-5 text-white" />
        </Link>
      </div>
    </header>
  );
};
