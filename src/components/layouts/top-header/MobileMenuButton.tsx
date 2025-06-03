
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface MobileMenuButtonProps {
  setSidebarOpen: (open: boolean) => void;
}

export const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({
  setSidebarOpen
}) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-white hover:bg-emerald-700/50 dark:hover:bg-slate-700/50 -ml-2"
      onClick={() => setSidebarOpen(true)}
    >
      <Menu className="h-6 w-6" />
    </Button>
  );
};
