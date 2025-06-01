
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface BackButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: () => void;
  children?: React.ReactNode;
}

export const BackButton = React.forwardRef<HTMLButtonElement, BackButtonProps>(
  ({ className, onClick, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="ghost"
        size="sm"
        className={cn("gap-2", className)}
        onClick={onClick}
        {...props}
      >
        <ArrowLeft className="h-4 w-4" />
        {children || "ย้อนกลับ"}
      </Button>
    );
  }
);

BackButton.displayName = "BackButton";
