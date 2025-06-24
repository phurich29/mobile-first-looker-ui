import React from 'react';
import { Button } from '@/components/ui/button';
import { User, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGuestMode } from '@/hooks/useGuestMode';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const UserProfileButton: React.FC = () => {
  const { isGuest, user } = useGuestMode();
  const navigate = useNavigate();

  const handleLoginClick = async () => {
    // สำหรับ guest: logout ก่อน (เผื่อมี session เก่าค้างอยู่) แล้วไปหน้า login
    if (isGuest) {
      await supabase.auth.signOut();
      navigate('/login');
    }
  };

  const handleLogoutClick = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  // สำหรับ Guest ไม่ต้องแสดงอะไร
  if (isGuest) {
    return null;
  }

  // สำหรับผู้ใช้ที่ login แล้ว แสดง dropdown menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white hover:bg-emerald-700/50"
        >
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleProfileClick}>
          <User className="h-4 w-4 mr-2" />
          ข้อมูลส่วนตัว
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogoutClick}>
          <LogIn className="h-4 w-4 mr-2" />
          ออกจากระบบ
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
