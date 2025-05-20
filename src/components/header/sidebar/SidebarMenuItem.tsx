
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMenuItemClasses } from "./sidebar-utils";

interface SidebarMenuItemProps {
  path: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  pathStartsWith?: string;
}

export const SidebarMenuItem = ({
  path,
  icon: Icon,
  label,
  isActive,
  isCollapsed,
  pathStartsWith
}: SidebarMenuItemProps) => {
  return (
    <Link 
      to={path} 
      className={getMenuItemClasses(isActive, isCollapsed, path, pathStartsWith)}
    >
      <Icon className="h-5 w-5" />
      {!isCollapsed && <span className="text-sm">{label}</span>}
    </Link>
  );
};
