
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

/**
 * Checks if the current location path matches the provided path
 */
export const useActivePath = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return { isActive };
};

/**
 * Get the appropriate CSS classes for a sidebar menu item
 */
export const getMenuItemClasses = (
  isActive: boolean, 
  isCollapsed: boolean,
  basePath: string,
  pathStartsWith?: string
) => {
  return cn(
    "flex items-center rounded-lg transition-colors", 
    isCollapsed ? "gap-2 py-2 px-1" : "gap-3 py-2.5 px-3",
    (isActive || (pathStartsWith && basePath.startsWith(pathStartsWith))) 
      ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" 
      : "hover:bg-gray-50 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300",
    isCollapsed && "justify-center"
  );
};

/**
 * Save sidebar collapse state to localStorage
 */
export const saveSidebarState = (isCollapsed: boolean) => {
  localStorage.setItem('sidebarCollapsed', isCollapsed.toString());
  
  // Dispatch custom event for other components
  window.dispatchEvent(new CustomEvent('sidebarStateChanged', { 
    detail: { isCollapsed } 
  }));
};

