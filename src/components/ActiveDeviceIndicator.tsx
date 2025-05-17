
import React from "react";
import { useDeviceContext } from "@/contexts/DeviceContext";
import { Button } from "@/components/ui/button";
import { Loader2, X, Laptop } from "lucide-react";

interface ActiveDeviceIndicatorProps {
  className?: string;
}

export const ActiveDeviceIndicator: React.FC<ActiveDeviceIndicatorProps> = ({ className }) => {
  const { selectedDeviceCode, selectedDeviceName, isLoadingDevice, clearSelectedDevice } = useDeviceContext();
  
  if (isLoadingDevice) {
    return (
      <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>กำลังโหลดอุปกรณ์...</span>
      </div>
    );
  }
  
  if (!selectedDeviceCode) {
    return null;
  }
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-md text-sm">
        <Laptop className="h-3.5 w-3.5" />
        <span className="font-medium">{selectedDeviceName || selectedDeviceCode}</span>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-5 w-5 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-800" 
          onClick={() => clearSelectedDevice()}
        >
          <X className="h-3 w-3" />
          <span className="sr-only">ล้างการเลือกอุปกรณ์</span>
        </Button>
      </div>
    </div>
  );
};
