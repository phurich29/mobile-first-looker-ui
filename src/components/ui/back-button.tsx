
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: () => void;
  children?: React.ReactNode;
  to?: string;
  ariaLabel?: string;
}

export const BackButton = React.forwardRef<HTMLButtonElement, BackButtonProps>(
  ({ className, onClick, children, to, ariaLabel, ...props }, ref) => {
    const navigate = useNavigate();

    const handleClick = () => {
      if (onClick) {
        onClick();
      } else if (to) {
        navigate(to);
      } else {
        navigate(-1); // Go back in history
      }
    };

    return (
      <Button
        ref={ref}
        variant="ghost"
        size="sm"
        className={cn("gap-2", className)}
        onClick={handleClick}
        aria-label={ariaLabel}
        {...props}
      >
        <ArrowLeft className="h-4 w-4" />
        {children || "ย้อนกลับ"}
      </Button>
    );
  }
);

BackButton.displayName = "BackButton";
