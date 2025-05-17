
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import { Laptop, Clock, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeviceCardProps {
  deviceCode: string;
  displayName?: string;
  lastUpdated?: string;
  isSelected: boolean;
  isDefaultDevice?: boolean;
  onClick: () => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  deviceCode,
  displayName,
  lastUpdated,
  isSelected,
  isDefaultDevice,
  onClick,
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "ไม่มีข้อมูล";
    
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: th });
    } catch (e) {
      return "ไม่มีข้อมูล";
    }
  };

  return (
    <Card 
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-all hover:shadow border",
        isSelected ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700" : "",
        isDefaultDevice && !isSelected ? "border-emerald-200 dark:border-emerald-800" : ""
      )}
    >
      <CardContent className="p-4 flex justify-between items-center">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {isDefaultDevice && (
              <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1">
                <Laptop className="h-3 w-3" />
                <span>อุปกรณ์เริ่มต้น</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <h3 className="font-medium">{displayName || deviceCode}</h3>
            {isSelected && (
              <Check className="h-4 w-4 text-emerald-500" />
            )}
          </div>
          <div className="text-xs text-muted-foreground">{deviceCode}</div>
          
          {lastUpdated && (
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{formatDate(lastUpdated)}</span>
            </div>
          )}
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </CardContent>
    </Card>
  );
};
