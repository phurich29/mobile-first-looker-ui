import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, Edit, Trash2, Plus, X } from "lucide-react";
import { User, UserRole } from "../types";
import { formatDate } from "../utils";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
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

interface Device {
  device_code: string;
  display_name?: string;
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
  const [availableDevices, setAvailableDevices] = useState<Device[]>([]);
  const [userDevices, setUserDevices] = useState<string[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const { toast } = useToast();

  // Fetch devices when editing starts
  const fetchDevices = async () => {
    setIsLoadingDevices(true);
    try {
      // Fetch all devices
      const { data: devicesData, error: devicesError } = await supabase
        .from('rice_quality_analysis')
        .select('device_code')
        .not('device_code', 'is', null)
        .not('device_code', 'eq', '');

      if (devicesError) throw devicesError;

      // Get unique device codes
      const uniqueDeviceCodes = new Set<string>();
      devicesData?.forEach(item => {
        if (item.device_code) {
          uniqueDeviceCodes.add(item.device_code);
        }
      });

      const deviceList = Array.from(uniqueDeviceCodes).map(code => ({
        device_code: code
      }));

      setAvailableDevices(deviceList);

      // Fetch user's current device access
      const { data: accessData, error: accessError } = await supabase
        .from('user_device_access')
        .select('device_code')
        .eq('user_id', user.id);

      if (accessError) throw accessError;

      setUserDevices(accessData?.map(item => item.device_code) || []);
    } catch (error) {
      console.error('Error fetching devices:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลอุปกรณ์ได้",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDevices(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    if (!isEditing) {
      fetchDevices();
    }
  };

  const grantDeviceAccess = async (deviceCode: string) => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('user_device_access')
        .insert({
          user_id: user.id,
          device_code: deviceCode,
          created_by: currentUser.id
        });

      if (error) throw error;

      setUserDevices(prev => [...prev, deviceCode]);
      toast({
        title: "เพิ่มสิทธิ์สำเร็จ",
        description: `เพิ่มสิทธิ์การเข้าถึงอุปกรณ์ ${deviceCode} เรียบร้อยแล้ว`
      });
    } catch (error) {
      console.error('Error granting device access:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มสิทธิ์การเข้าถึงอุปกรณ์ได้",
        variant: "destructive"
      });
    }
  };

  const revokeDeviceAccess = async (deviceCode: string) => {
    try {
      const { error } = await supabase
        .from('user_device_access')
        .delete()
        .eq('user_id', user.id)
        .eq('device_code', deviceCode);

      if (error) throw error;

      setUserDevices(prev => prev.filter(code => code !== deviceCode));
      toast({
        title: "ลบสิทธิ์สำเร็จ",
        description: `ลบสิทธิ์การเข้าถึงอุปกรณ์ ${deviceCode} เรียบร้อยแล้ว`
      });
    } catch (error) {
      console.error('Error revoking device access:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบสิทธิ์การเข้าถึงอุปกรณ์ได้",
        variant: "destructive"
      });
    }
  };

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
            <ChevronDown className="h-3 w-3" />
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
              {isLoadingDevices ? (
                <div className="text-xs text-gray-500 dark:text-gray-400">กำลังโหลดข้อมูลอุปกรณ์...</div>
              ) : (
                <div className="space-y-2">
                  {/* Current devices */}
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400">อุปกรณ์ที่มีสิทธิ์เข้าถึง:</label>
                    <div className="mt-1 space-y-1 max-h-32 overflow-y-auto">
                      {userDevices.length === 0 ? (
                        <div className="text-xs text-gray-500 dark:text-gray-400 italic">ไม่มีอุปกรณ์ที่ได้รับสิทธิ์</div>
                      ) : (
                        userDevices.map(deviceCode => (
                          <div key={deviceCode} className="flex items-center justify-between bg-gray-100 dark:bg-slate-600 rounded px-2 py-1">
                            <span className="text-xs dark:text-gray-200">{deviceCode}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => revokeDeviceAccess(deviceCode)}
                              className="h-5 w-5 p-0 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Available devices to add */}
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400">เพิ่มอุปกรณ์:</label>
                    <div className="mt-1 space-y-1 max-h-32 overflow-y-auto">
                      {availableDevices
                        .filter(device => !userDevices.includes(device.device_code))
                        .map(device => (
                          <div key={device.device_code} className="flex items-center justify-between bg-gray-50 dark:bg-slate-700 rounded px-2 py-1">
                            <span className="text-xs dark:text-gray-200">{device.device_code}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => grantDeviceAccess(device.device_code)}
                              className="h-5 w-5 p-0 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        ))
                      }
                      {availableDevices.filter(device => !userDevices.includes(device.device_code)).length === 0 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 italic">ไม่มีอุปกรณ์เพิ่มเติมให้เพิ่ม</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Role Management Dropdown */}
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
