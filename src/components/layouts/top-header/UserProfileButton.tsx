import React from 'react';
import { Button } from '@/components/ui/button';
import { User, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUnifiedPermissions } from '@/hooks/useUnifiedPermissions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const UserProfileButton: React.FC = () => {
  const { isGuest } = useUnifiedPermissions();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleImmediateLogout = () => {
    // Navigate to logout page for immediate cleanup
    navigate('/logout');
  };

  // For guests, don't show anything
  if (isGuest) {
    return null;
  }

  // For authenticated users, show dropdown menu
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
        <DropdownMenuItem onClick={handleImmediateLogout}>
          <LogIn className="h-4 w-4 mr-2" />
          ออกจากระบบ
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
