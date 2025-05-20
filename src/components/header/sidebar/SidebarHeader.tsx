
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarHeaderProps {
  isCollapsed: boolean;
  isMobile: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const SidebarHeader = ({ 
  isCollapsed, 
  isMobile, 
  setSidebarOpen 
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
        isCollapsed ? "mb-6" : "mb-8" // ลดช่องว่างด้านล่างเมื่อหดตัว
      )}>
        <div className={cn("flex items-center gap-2", !isMobile && isCollapsed && "justify-center w-full")}>
          <img src="/lovable-uploads/649554cd-4d80-484a-995d-e49f2721a07d.png" alt="RiceFlow Logo" className={cn(
            "rounded-full", 
            isCollapsed ? "h-8 w-auto" : "h-10 w-auto" // ลดขนาดโลโก้ในโหมดหดตัว
          )} />
          {(isMobile || !isCollapsed) && <h2 className="text-xl font-semibold text-emerald-700 dark:text-emerald-400">RiceFlow</h2>}
        </div>
      </div>
    </>
  );
};
