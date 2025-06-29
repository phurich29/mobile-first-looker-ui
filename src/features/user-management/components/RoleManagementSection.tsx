
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { UserRole } from "../types";

interface RoleManagementSectionProps {
  userRoles: string[];
  isSuperAdmin: boolean;
  isProcessing: boolean;
  onChangeUserRole: (role: UserRole, isAdding: boolean) => void;
  userId: string;
}

export function RoleManagementSection({
  userRoles,
  isSuperAdmin,
  isProcessing,
  onChangeUserRole,
  userId
}: RoleManagementSectionProps) {
  const handleRoleChange = (role: UserRole, isAdding: boolean) => {
    onChangeUserRole(role, isAdding);
  };

  return (
    <div>
      <h5 className="text-xs font-semibold mb-2 dark:text-gray-300">จัดการสิทธิ์ผู้ใช้:</h5>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isProcessing} className="h-7 px-2 text-xs dark:text-gray-300 dark:border-slate-600 dark:hover:bg-slate-700">
            <span>เปลี่ยนสิทธิ์</span>
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 dark:bg-slate-800 dark:border-slate-700">
          {!userRoles.includes('user') ? (
            <DropdownMenuItem onClick={() => handleRoleChange('user', true)} className="text-[11px] dark:text-gray-300 dark:focus:bg-slate-700 dark:focus:text-gray-100">
              เพิ่มสิทธิ์ User
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => handleRoleChange('user', false)} className="text-[11px] dark:text-gray-300 dark:focus:bg-slate-700 dark:focus:text-gray-100">
              ลบสิทธิ์ User
            </DropdownMenuItem>
          )}
          
          {!userRoles.includes('admin') ? (
            <DropdownMenuItem onClick={() => handleRoleChange('admin', true)} className="text-[11px] dark:text-gray-300 dark:focus:bg-slate-700 dark:focus:text-gray-100">
              เพิ่มสิทธิ์ Admin
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => handleRoleChange('admin', false)} className="text-[11px] dark:text-gray-300 dark:focus:bg-slate-700 dark:focus:text-gray-100">
              ลบสิทธิ์ Admin
            </DropdownMenuItem>
          )}
          
          {isSuperAdmin && !userRoles.includes('superadmin') ? (
            <DropdownMenuItem onClick={() => handleRoleChange('superadmin', true)} className="text-[11px] dark:text-gray-300 dark:focus:bg-slate-700 dark:focus:text-gray-100">
              เพิ่มสิทธิ์ Superadmin
            </DropdownMenuItem>
          ) : isSuperAdmin && userRoles.includes('superadmin') ? (
            <DropdownMenuItem onClick={() => handleRoleChange('superadmin', false)} className="text-[11px] dark:text-gray-300 dark:focus:bg-slate-700 dark:focus:text-gray-100">
              ลบสิทธิ์ Superadmin
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
