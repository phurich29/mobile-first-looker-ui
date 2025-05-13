
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, Edit, Trash2 } from "lucide-react";
import { User, UserRole } from "../types";
import { formatDate } from "../utils";

interface UserRowProps {
  user: User;
  isSuperAdmin: boolean;
  isProcessing: boolean;
  onApproveUser: (userId: string) => void;
  onOpenResetDialog: (userId: string, email: string) => void;
  onOpenDeleteDialog: (userId: string, email: string) => void;
  onChangeUserRole: (userId: string, role: UserRole, isAdding: boolean) => void;
}

export function UserRow({
  user,
  isSuperAdmin,
  isProcessing,
  onApproveUser,
  onOpenResetDialog,
  onOpenDeleteDialog,
  onChangeUserRole
}: UserRowProps) {
  return (
    <TableRow className={user.roles.includes('waiting_list') ? "bg-amber-50" : ""}>
      <TableCell className="py-1">
        <div className="space-y-1">
          <div className="flex flex-col">
            <span className="font-medium text-xs">{user.email}</span>
            <span className="text-[10px] text-gray-500">
              เข้าสู่ระบบล่าสุด: {formatDate(user.last_sign_in_at)}
            </span>
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {user.roles.length > 0 ? user.roles.map((role) => (
              <Badge 
                key={role} 
                className={`text-[10px] px-1 py-0 ${
                  role === 'superadmin' ? 'bg-red-100 text-red-800 hover:bg-red-200' : 
                  role === 'admin' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 
                  role === 'waiting_list' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' :
                  'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
                variant="outline"
              >
                {role}
              </Badge>
            )) : (
              <span className="text-gray-400 text-[10px] italic">ไม่มีสิทธิ์</span>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="py-1 text-right">
        <div className="flex items-center justify-end space-x-1">
          {user.roles.includes('waiting_list') && !user.roles.includes('user') && (
            <Button 
              variant="default" 
              size="sm"
              onClick={() => onApproveUser(user.id)}
              disabled={isProcessing}
              className="bg-emerald-600 hover:bg-emerald-700 text-[10px] h-6 px-1"
            >
              อนุมัติ
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenResetDialog(user.id, user.email)}
            className="h-6 w-6 p-0"
          >
            <Edit className="h-3 w-3" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenDeleteDialog(user.id, user.email)}
            className="text-red-500 hover:text-red-600 h-6 w-6 p-0"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isProcessing} className="h-6 w-6 p-0">
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {!user.roles.includes('user') ? (
                <DropdownMenuItem onClick={() => onChangeUserRole(user.id, 'user', true)} className="text-[11px]">
                  เพิ่มสิทธิ์ User
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onChangeUserRole(user.id, 'user', false)} className="text-[11px]">
                  ลบสิทธิ์ User
                </DropdownMenuItem>
              )}
              
              {!user.roles.includes('admin') ? (
                <DropdownMenuItem onClick={() => onChangeUserRole(user.id, 'admin', true)} className="text-[11px]">
                  เพิ่มสิทธิ์ Admin
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onChangeUserRole(user.id, 'admin', false)} className="text-[11px]">
                  ลบสิทธิ์ Admin
                </DropdownMenuItem>
              )}
              
              {/* ถ้าเป็น superadmin จึงจะสามารถจัดการสิทธิ์ superadmin ได้ */}
              {isSuperAdmin && !user.roles.includes('superadmin') ? (
                <DropdownMenuItem onClick={() => onChangeUserRole(user.id, 'superadmin', true)} className="text-[11px]">
                  เพิ่มสิทธิ์ Superadmin
                </DropdownMenuItem>
              ) : isSuperAdmin && user.roles.includes('superadmin') ? (
                <DropdownMenuItem onClick={() => onChangeUserRole(user.id, 'superadmin', false)} className="text-[11px]">
                  ลบสิทธิ์ Superadmin
                </DropdownMenuItem>
              ) : null}
              
              {!user.roles.includes('waiting_list') ? (
                <DropdownMenuItem onClick={() => onChangeUserRole(user.id, 'waiting_list', true)} className="text-[11px]">
                  เพิ่มสถานะ Waiting List
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onChangeUserRole(user.id, 'waiting_list', false)} className="text-[11px]">
                  ลบสถานะ Waiting List
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}
