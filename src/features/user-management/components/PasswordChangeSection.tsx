
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import * as userService from "../services/userService";

interface PasswordChangeSectionProps {
  userId: string;
  userEmail: string;
  isSuperAdmin: boolean;
  userRoles: string[];
  isProcessing: boolean;
}

export function PasswordChangeSection({
  userId,
  userEmail,
  isSuperAdmin,
  userRoles,
  isProcessing
}: PasswordChangeSectionProps) {
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
    if (!isSuperAdmin && userRoles.includes('superadmin')) {
      toast({
        title: "ไม่มีสิทธิ์",
        description: "ไม่สามารถเปลี่ยนรหัสผ่านของ Superadmin ได้",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    
    try {
      await userService.resetUserPassword(userId, newPassword);
      
      toast({
        title: "เปลี่ยนรหัสผ่านสำเร็จ",
        description: `เปลี่ยนรหัสผ่านสำหรับ ${userEmail} เรียบร้อยแล้ว`,
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

  return (
    <div className="space-y-2">
      <h5 className="text-xs font-semibold mb-2 dark:text-gray-300">เปลี่ยนรหัสผ่าน:</h5>
      <div>
        <label htmlFor={`newPassword-${userId}`} className="text-xs text-gray-600 dark:text-gray-400">รหัสผ่านใหม่:</label>
        <input 
          id={`newPassword-${userId}`}
          type="password" 
          placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="mt-1 w-full border rounded-md p-2 text-xs dark:bg-slate-700 dark:text-white dark:border-slate-600 focus:ring-emerald-500 focus:border-emerald-500" 
        />
      </div>
      <div>
        <label htmlFor={`confirmPassword-${userId}`} className="text-xs text-gray-600 dark:text-gray-400">ยืนยันรหัสผ่านใหม่:</label>
        <input 
          id={`confirmPassword-${userId}`}
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
  );
}
