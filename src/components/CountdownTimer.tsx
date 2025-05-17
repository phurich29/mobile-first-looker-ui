
import React from "react";
import { useCountdown } from "@/hooks/use-countdown";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDeviceContext } from "@/contexts/DeviceContext";

interface CountdownTimerProps {
  seconds?: number;
  onComplete?: () => void;
  className?: string;
  buttonClassName?: string;
  iconSize?: number;
  useGlobal?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  seconds = 60,
  onComplete,
  className,
  buttonClassName,
  iconSize = 16,
  useGlobal = false,
}) => {
  const { selectedDevice } = useDeviceContext();
  const { seconds: remainingSeconds, isActive, reset } = useCountdown({
    initialSeconds: seconds,
    onComplete,
    useGlobal,
  });

  // Log selected device for debugging
  React.useEffect(() => {
    console.log("CountdownTimer - Selected Device:", selectedDevice);
  }, [selectedDevice]);

  // Calculate the formatted time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-1 text-sm",
        className
      )}
    >
      <span className="text-gray-600 dark:text-gray-300">
        {formatTime(remainingSeconds)}
      </span>
      <Button
        size="icon"
        variant="ghost"
        className={cn(
          "h-6 w-6 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800",
          buttonClassName
        )}
        onClick={() => reset()}
        title="รีเซ็ตเวลาและดึงข้อมูลล่าสุด"
      >
        <RotateCcw className={cn(`h-${iconSize/4} w-${iconSize/4}`)} />
      </Button>
    </div>
  );
};
