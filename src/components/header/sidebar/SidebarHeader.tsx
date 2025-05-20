
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SidebarHeaderProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  isMobile: boolean;
}

export const SidebarHeader = ({ isCollapsed, toggleCollapse, isMobile }: SidebarHeaderProps) => {
  return (
    <>
      {/* Collapse Button for Desktop only */}
      {!isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapse}
          className="absolute right-2 top-2 hidden md:flex bg-emerald-50 hover:bg-emerald-100 dark:bg-gray-800 dark:hover:bg-gray-700"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      )}
      
      {/* Logo and Title */}
      <div className={cn(
        "flex items-center mt-4",
        isCollapsed ? "mb-6 justify-center" : "mb-8 justify-between"
      )}>
        <div className={cn(
          "flex items-center gap-2",
          isCollapsed && "flex-col justify-center w-full"
        )}>
          <img 
            src="/lovable-uploads/649554cd-4d80-484a-995d-e49f2721a07d.png" 
            alt="RiceFlow Logo" 
            className={cn("rounded-full", isCollapsed ? "h-8 w-8" : "h-10 w-10")} 
          />
          {!isCollapsed && <h2 className="text-xl font-semibold text-emerald-700 dark:text-emerald-400">RiceFlow</h2>}
        </div>
      </div>
    </>
  );
};
