
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface SidebarHeaderProps {
  isCollapsed: boolean;
  isMobile: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleCollapse?: () => void;
}

export const SidebarHeader = ({ 
  isCollapsed, 
  isMobile, 
  setSidebarOpen,
  toggleCollapse 
}: SidebarHeaderProps) => {
  return (
    <>
      {/* Mobile Close Button - แสดงเฉพาะบน mobile */}
      {isMobile && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(false)}
          className="absolute right-2 top-2 md:hidden"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      
      <div className={cn(
        "flex justify-between items-center mt-4",
        isCollapsed ? "mb-4" : "mb-6" // ลดช่องว่างด้านล่างเมื่อหดตัว
      )}>
        <div className={cn("flex items-center gap-2", !isMobile && isCollapsed && "justify-center w-full")}>
          <img src="/lovable-uploads/649554cd-4d80-484a-995d-e49f2721a07d.png" alt="RiceFlow Logo" className={cn(
            "rounded-full", 
            isCollapsed ? "h-8 w-auto" : "h-10 w-auto" // ลดขนาดโลโก้ในโหมดหดตัว
          )} />
          {(isMobile || !isCollapsed) && <h2 className="text-xl font-semibold text-emerald-700 dark:text-emerald-400">RiceFlow</h2>}
        </div>
        
        {/* Collapse Button - แสดงเฉพาะบน desktop */}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="h-8 w-8 p-0 hover:bg-emerald-100 dark:hover:bg-emerald-900"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            )}
          </Button>
        )}
      </div>
      
      {/* Additional image below logo */}
      {(isMobile || !isCollapsed) && (
        <div className="flex justify-center mb-4">
          <Link to="/assistant" className="block w-full">
            <Button 
              className="w-full bg-gradient-to-r from-chinese-red to-chinese-gold text-chinese-cream font-bold py-4 px-6 rounded-xl border-2 border-chinese-gold shadow-lg hover:shadow-xl hover:from-chinese-gold hover:to-chinese-red transition-all duration-300 transform hover:scale-105"
            >
              <span className="text-lg">🐉 หลงจู๊ 廊主 Ai assistant 🐉</span>
            </Button>
          </Link>
        </div>
      )}
    </>
  );
};
