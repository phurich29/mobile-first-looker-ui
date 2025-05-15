
import React from "react";
import { useCountdown } from "@/hooks/use-countdown";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  initialSeconds?: number;
  onComplete?: () => void;
  className?: string;
  iconSize?: number;
  showSeconds?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  initialSeconds = 60,
  onComplete,
  className,
  iconSize = 14,
  showSeconds = true
}) => {
  const { seconds, isActive } = useCountdown({
    initialSeconds,
    onComplete,
    autoStart: true
  });

  return (
    <div className={cn(
      "flex items-center gap-1 text-xs text-gray-500",
      className
    )}>
      <Clock size={iconSize} className="text-emerald-500" />
      {showSeconds && (
        <span className="font-mono">{seconds}s</span>
      )}
    </div>
  );
};
