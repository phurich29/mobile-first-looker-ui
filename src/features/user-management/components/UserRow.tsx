
import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import { ChevronDown, Trash2 } from "lucide-react";
import { User, UserRole } from "../types";
import { formatDate } from "../utils";
import { useDeviceManagement } from "./hooks/useDeviceManagement";
import { DeviceAccessSection } from "./DeviceAccessSection";
import { PasswordChangeSection } from "./PasswordChangeSection";
import { RoleManagementSection } from "./RoleManagementSection";

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
  const [isEditing, setIsEditing] = useState(false);
  const {
    availableDevices,
    userDevices,
    isLoadingDevices,
    fetchDevices,
    grantDeviceAccess,
    revokeDeviceAccess
  } = useDeviceManagement();

  const handleEditClick = () => {
    const newEditingState = !isEditing;
    setIsEditing(newEditingState);
    if (newEditingState && !isEditing) {
      fetchDevices(user.id);
    }
  };

  const handleGrantAccess = (deviceCode: string) => {
    grantDeviceAccess(user.id, deviceCode);
  };

  const handleRevokeAccess = (deviceCode: string) => {
    revokeDeviceAccess(user.id, deviceCode);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <>
      <TableRow className={`${!user.roles.includes('user') ? 'bg-amber-50 dark:bg-amber-900/30' : ''} dark:border-slate-700 ${isEditing ? 'border-b-0 dark:border-b-0' : ''}`}>
        <TableCell className="py-1">
          <div className="space-y-1 py-3">
            <div className="flex flex-col">
              <span className="font-medium text-xs dark:text-gray-100">{user.email}</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                เข้าสู่ระบบล่าสุด: {formatDate(user.last_sign_in_at)}
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {user.roles.length > 0 ? user.roles.map((role) => (
                <Badge 
                  key={role} 
                  className={`text-[10px] px-1 py-0 dark:border-transparent ${
                    role === 'superadmin' ? 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-700/30 dark:text-red-300 dark:hover:bg-red-600/40' : 
                    role === 'admin' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-700/30 dark:text-blue-300 dark:hover:bg-blue-600/40' : 
                    'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-700/30 dark:text-green-300 dark:hover:bg-green-600/40'
                  }`}
                  variant="outline"
                >
                  {role}
                </Badge>
              )) : (
                <span className="text-gray-400 text-[10px] italic dark:text-gray-500">ไม่มีสิทธิ์</span>
              )}
            </div>
          </div>
        </TableCell>
        <TableCell className="py-1 text-right">
          <div className="flex items-center justify-end space-x-1">
            {!user.roles.includes('user') && (
              <Button 
                variant="default" 
                size="sm"
                onClick={() => onApproveUser(user.id)}
                disabled={isProcessing}
                className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-700 dark:hover:bg-emerald-800 text-[10px] h-6 px-1"
              >
                อนุมัติ
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenDeleteDialog(user.id, user.email)}
              className="text-red-500 hover:text-red-600 h-6 w-6 p-0 dark:text-red-500 dark:hover:text-red-400 dark:border-slate-600 dark:hover:border-slate-500"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            
            <Button variant="outline" size="sm" disabled={isProcessing} onClick={handleEditClick} className="h-6 w-6 p-0 dark:text-gray-400 dark:hover:text-gray-200 dark:border-slate-600 dark:hover:border-slate-500">
              <ChevronDown className={`h-3 w-3 transition-transform ${isEditing ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {/* Collapsible Row for Editing Form */}
      <TableRow className={`${!isEditing ? 'hidden' : ''} ${!user.roles.includes('user') ? 'bg-amber-50 dark:bg-amber-900/30' : ''} dark:border-slate-700`}>
        <TableCell colSpan={2} className="p-0">
          <Collapsible
            open={isEditing}
            onOpenChange={setIsEditing}
            className="w-full"
          >
            <CollapsibleContent className="p-4 border-t dark:border-slate-700 space-y-2">
              <h4 className="text-sm font-medium dark:text-gray-200">แก้ไขข้อมูล: {user.email}</h4>
              <div>
                <label htmlFor={`displayName-${user.id}`} className="text-xs text-gray-600 dark:text-gray-400">ชื่อที่แสดง:</label>
                <input 
                  id={`displayName-${user.id}`}
                  type="text" 
                  placeholder="Display Name" 
                  defaultValue={user.email}
                  className="mt-1 w-full border rounded-md p-2 text-xs dark:bg-slate-700 dark:text-white dark:border-slate-600 focus:ring-emerald-500 focus:border-emerald-500" 
                />
              </div>

              {/* Device Access Management Section */}
              <div className="mt-4 pt-4 border-t dark:border-slate-600">
                <h5 className="text-xs font-semibold mb-2 dark:text-gray-300">จัดการอุปกรณ์ที่เข้าถึงได้:</h5>
                <DeviceAccessSection
                  availableDevices={availableDevices}
                  userDevices={userDevices}
                  isLoadingDevices={isLoadingDevices}
                  onGrantAccess={handleGrantAccess}
                  onRevokeAccess={handleRevokeAccess}
                />
              </div>

              {/* Role Management Section */}
              <div className="mt-4 pt-4 border-t dark:border-slate-600">
                <RoleManagementSection
                  userRoles={user.roles}
                  isSuperAdmin={isSuperAdmin}
                  isProcessing={isProcessing}
                  onChangeUserRole={onChangeUserRole}
                  userId={user.id}
                />
              </div>

              {/* Change Password Section */}
              <div className="mt-4 pt-4 border-t dark:border-slate-600">
                <PasswordChangeSection
                  userId={user.id}
                  userEmail={user.email}
                  isSuperAdmin={isSuperAdmin}
                  userRoles={user.roles}
                  isProcessing={isProcessing}
                />
              </div>

              <div className="flex justify-end space-x-2 mt-4 pt-4 border-t dark:border-slate-600">
                <Button size="sm" variant="ghost" onClick={handleCancel} className="text-xs h-7 dark:text-gray-300 dark:hover:bg-slate-700">
                  ยกเลิก
                </Button>
                <Button size="sm" onClick={() => { setIsEditing(false); }} className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-700 dark:hover:bg-emerald-800">
                  บันทึก
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </TableCell>
      </TableRow>
    </>
  );
}
