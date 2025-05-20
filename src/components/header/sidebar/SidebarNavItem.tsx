
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface SidebarNavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
}

export const SidebarNavItem = ({ to, icon: Icon, label, isActive, isCollapsed }: SidebarNavItemProps) => {
  return (
    <Link to={to} className={cn(
      "flex items-center rounded-lg transition-colors", 
      isCollapsed ? "gap-2 py-2 px-1" : "gap-3 py-2.5 px-3",
      isActive 
        ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" 
        : "hover:bg-gray-50 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300",
      isCollapsed && "justify-center"
    )}>
      <Icon className="h-5 w-5" />
      {!isCollapsed && <span className="text-sm">{label}</span>}
    </Link>
  );
};
