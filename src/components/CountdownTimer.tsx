
import React from "react";
import { useCountdown } from "@/hooks/use-countdown";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  initialSeconds?: number;
  onComplete?: () => void;
  className?: string;
  iconSize?: number;
  showSeconds?: boolean;
  useGlobal?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  initialSeconds = 60,
  onComplete,
  className,
  iconSize = 14,
  showSeconds = true,
  useGlobal = false
}) => {
  const { seconds } = useCountdown({
    initialSeconds,
    onComplete,
    autoStart: true,
    useGlobal
  });

  return (
    <div className={cn(
      "flex items-center gap-1 text-xs text-gray-500",
      className
    )}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={iconSize} 
        height={iconSize} 
        viewBox="0 0 800 800" 
        fill="currentColor"
        className="text-yellow-400"
      >
        {/* นาฬิกาทรายสีเหลือง */}
        <path d="M178.6 0h442.9c4.6 0 9.1 1.1 13.2 3.1 4.1 2.1 7.8 5.1 10.8 8.8 3 3.8 5.3 8.2 6.7 13.1 1.4 4.8 1.8 9.9 1.1 14.9-5 41.9-15.4 83.2-30.9 122.6-15 39.2-34.8 76.1-58.6 109.9-23.7 33.8-51.4 64.1-82.3 90.2-27.3 23-56.2 43.4-86.5 60.8 21.4 12.1 42 25.8 61.6 41.1 35.8 27.7 67.6 60.2 94.3 96.4 26.7 36.2 48.1 76 63.4 118.1 5.3 15.2 9.9 30.5 13.9 46.1.7 5 .3 10.1-1.1 15-1.4 4.8-3.7 9.3-6.7 13.1-3 3.8-6.6 6.8-10.8 8.8-4.1 2.1-8.6 3.1-13.2 3.1H178.6c-4.6 0-9.1-1.1-13.2-3.1-4.1-2.1-7.8-5.1-10.8-8.8-3-3.8-5.3-8.2-6.7-13.1-1.4-4.8-1.8-9.9-1.1-15 4-15.6 8.6-31 13.9-46.1 15.3-42.1 36.7-81.9 63.4-118.1 26.7-36.2 58.5-68.7 94.3-96.4 19.6-15.3 40.2-29 61.6-41.1-30.3-17.4-59.2-37.8-86.5-60.8-30.9-26.1-58.6-56.4-82.3-90.2-23.7-33.8-43.6-70.7-58.6-109.9-15.5-39.4-25.9-80.7-30.9-122.6-0.7-5-0.3-10.1 1.1-14.9 1.4-4.8 3.7-9.3 6.7-13.1 3-3.8 6.6-6.8 10.8-8.8 4.1-2.1 8.6-3.1 13.2-3.1z" />
        <path d="M248.3 685.7V683c0-83.7 68.1-151.7 151.7-151.7S551.7 599.3 551.7 683v2.7H248.3z" className="fill-yellow-200" />
        <path d="M400 436.3c83.7 0 151.7-68.1 151.7-151.7v-2.7H248.3v2.7c0 83.6 68.1 151.7 151.7 151.7z" className="fill-yellow-200" />
      </svg>
      {showSeconds && (
        <span className="font-mono">{seconds}s</span>
      )}
    </div>
  );
};
