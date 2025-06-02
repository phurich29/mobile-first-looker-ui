
import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, Edit, Trash2 } from "lucide-react";
import { User, UserRole } from "../types";
import { formatDate } from "../utils";
import { useToast } from "@/components/ui/use-toast";
import * as userService from "../services/userService";

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
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const { toast } = useToast();

  const handlePasswordChange = async () => {
    // Validation
    if (!newPassword.trim()) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณากรอกรหัสผ่านใหม่",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "ข้อผิดพลาด",
        description: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "ข้อผิดพลาด",
        description: "รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน",
        variant: "destructive",
      });
      return;
    }

    // Check permissions for superadmin users
    if (!isSuperAdmin && user.roles.includes('superadmin')) {
      toast({
        title: "ไม่มีสิทธิ์",
        description: "ไม่สามารถเปลี่ยนรหัสผ่านของ Superadmin ได้",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    
    try {
      await userService.resetUserPassword(user.id, newPassword);
      
      toast({
        title: "เปลี่ยนรหัสผ่านสำเร็จ",
        description: `เปลี่ยนรหัสผ่านสำหรับ ${user.email} เรียบร้อยแล้ว`,
      });
      
      // Reset form
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error("Error changing password:", error);
      
      toast({
        title: "เปลี่ยนรหัสผ่านไม่สำเร็จ",
        description: error.message || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <>
      <TableRow className={`${user.roles.includes('waiting_list') ? 'bg-amber-50 dark:bg-amber-900/30' : ''} dark:border-slate-700 ${isEditing ? 'border-b-0 dark:border-b-0' : ''}`}>
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
                  role === 'waiting_list' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-700/30 dark:text-amber-300 dark:hover:bg-amber-600/40' :
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
          {user.roles.includes('waiting_list') && !user.roles.includes('user') && (
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
          
          <Button variant="outline" size="sm" disabled={isProcessing} onClick={() => setIsEditing((prev) => !prev)} className="h-6 w-6 p-0 dark:text-gray-400 dark:hover:text-gray-200 dark:border-slate-600 dark:hover:border-slate-500">
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
    {/* Collapsible Row for Editing Form */}
    <TableRow className={`${!isEditing ? 'hidden' : ''} ${user.roles.includes('waiting_list') ? 'bg-amber-50 dark:bg-amber-900/30' : ''} dark:border-slate-700`}>
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
            {/* Role Management Dropdown Moved Here */}
            <div className="mt-4 pt-4 border-t dark:border-slate-600">
              <h5 className="text-xs font-semibold mb-2 dark:text-gray-300">จัดการสิทธิ์ผู้ใช้:</h5>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isProcessing} className="h-7 px-2 text-xs dark:text-gray-300 dark:border-slate-600 dark:hover:bg-slate-700">
                    <span>เปลี่ยนสิทธิ์</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 dark:bg-slate-800 dark:border-slate-700">
                  {!user.roles.includes('user') ? (
                    <DropdownMenuItem onClick={() => onChangeUserRole(user.id, 'user', true)} className="text-[11px] dark:text-gray-300 dark:focus:bg-slate-700 dark:focus:text-gray-100">
                      เพิ่มสิทธิ์ User
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => onChangeUserRole(user.id, 'user', false)} className="text-[11px] dark:text-gray-300 dark:focus:bg-slate-700 dark:focus:text-gray-100">
                      ลบสิทธิ์ User
                    </DropdownMenuItem>
                  )}
                  
                  {!user.roles.includes('admin') ? (
                    <DropdownMenuItem onClick={() => onChangeUserRole(user.id, 'admin', true)} className="text-[11px] dark:text-gray-300 dark:focus:bg-slate-700 dark:focus:text-gray-100">
                      เพิ่มสิทธิ์ Admin
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => onChangeUserRole(user.id, 'admin', false)} className="text-[11px] dark:text-gray-300 dark:focus:bg-slate-700 dark:focus:text-gray-100">
                      ลบสิทธิ์ Admin
                    </DropdownMenuItem>
                  )}
                  
                  {isSuperAdmin && !user.roles.includes('superadmin') ? (
                    <DropdownMenuItem onClick={() => onChangeUserRole(user.id, 'superadmin', true)} className="text-[11px] dark:text-gray-300 dark:focus:bg-slate-700 dark:focus:text-gray-100">
                      เพิ่มสิทธิ์ Superadmin
                    </DropdownMenuItem>
                  ) : isSuperAdmin && user.roles.includes('superadmin') ? (
                    <DropdownMenuItem onClick={() => onChangeUserRole(user.id, 'superadmin', false)} className="text-[11px] dark:text-gray-300 dark:focus:bg-slate-700 dark:focus:text-gray-100">
                      ลบสิทธิ์ Superadmin
                    </DropdownMenuItem>
                  ) : null}
                  
                  {!user.roles.includes('waiting_list') ? (
                    <DropdownMenuItem onClick={() => onChangeUserRole(user.id, 'waiting_list', true)} className="text-[11px] dark:text-gray-300 dark:focus:bg-slate-700 dark:focus:text-gray-100">
                      เพิ่มสถานะ Waiting List
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => onChangeUserRole(user.id, 'waiting_list', false)} className="text-[11px] dark:text-gray-300 dark:focus:bg-slate-700 dark:focus:text-gray-100">
                      ลบสถานะ Waiting List
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Change Password Form */}
            <div className="mt-4 pt-4 border-t dark:border-slate-600 space-y-2">
              <h5 className="text-xs font-semibold mb-2 dark:text-gray-300">เปลี่ยนรหัสผ่าน:</h5>
              <div>
                <label htmlFor={`newPassword-${user.id}`} className="text-xs text-gray-600 dark:text-gray-400">รหัสผ่านใหม่:</label>
                <input 
                  id={`newPassword-${user.id}`}
                  type="password" 
                  placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 w-full border rounded-md p-2 text-xs dark:bg-slate-700 dark:text-white dark:border-slate-600 focus:ring-emerald-500 focus:border-emerald-500" 
                />
              </div>
              <div>
                <label htmlFor={`confirmPassword-${user.id}`} className="text-xs text-gray-600 dark:text-gray-400">ยืนยันรหัสผ่านใหม่:</label>
                <input 
                  id={`confirmPassword-${user.id}`}
                  type="password" 
                  placeholder="ยืนยันรหัสผ่านใหม่"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 w-full border rounded-md p-2 text-xs dark:bg-slate-700 dark:text-white dark:border-slate-600 focus:ring-emerald-500 focus:border-emerald-500" 
                />
              </div>
              <Button 
                size="sm" 
                onClick={handlePasswordChange}
                disabled={isProcessing || isChangingPassword || !newPassword || newPassword !== confirmPassword}
                className="text-xs h-7 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800 mt-2"
              >
                {isChangingPassword ? "กำลังเปลี่ยน..." : "เปลี่ยนรหัสผ่าน"}
              </Button>
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
