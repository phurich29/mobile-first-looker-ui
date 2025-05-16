
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { HeaderClock } from "./HeaderClock";

interface HeaderMainContentProps {
  setSidebarOpen: (open: boolean) => void;
}

export const HeaderMainContent = ({ setSidebarOpen }: HeaderMainContentProps) => {
  const isMobile = useIsMobile();
  
  return (
    <header className={`flex items-center justify-between bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg ${!isMobile ? 'w-full md:ml-64 md:py-6 px-8' : 'px-4 py-5'}`}>
      {/* Mobile Menu and Logo Group */}
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white p-1 hover:bg-emerald-600/70 md:hidden" 
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5 text-white" />
        </Button>
        
        {/* Add RiceFlow Logo in header - Made larger and more prominent */}
        <div className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/649554cd-4d80-484a-995d-e49f2721a07d.png" 
            alt="RiceFlow Logo" 
            className="h-10 w-10 rounded-full border-2 border-white/70 shadow-md" 
          />
          {!isMobile && <span className="font-bold text-lg text-white">RiceFlow</span>}
        </div>
      </div>

      {/* Digital Clock */}
      <HeaderClock />
    
      <div className="flex items-center">
        {/* Bell notification link with regular styling, no forced colors */}
        <Link to="/notifications" className="bg-white/20 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center hover:bg-white/30 transition-colors shadow-inner">
          <Bell className="h-5 w-5 text-white" />
        </Link>
      </div>
    </header>
  );
};
