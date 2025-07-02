import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, X } from "lucide-react";
import { HiddenDevice } from "../types";

interface HiddenDevicesListProps {
  hiddenDevices: HiddenDevice[];
  onRemoveDevice: (deviceId: string, deviceCode: string) => void;
}

export function HiddenDevicesList({ hiddenDevices, onRemoveDevice }: HiddenDevicesListProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">
        รายการอุปกรณ์ที่ซ่อนการแสดงผล ({hiddenDevices.length} เครื่อง)
      </h4>
      
      {hiddenDevices.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>แสดงอุปกรณ์ทั้งหมด</p>
          <p className="text-xs">ยังไม่มีอุปกรณ์ที่ซ่อนการแสดงผล</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {hiddenDevices.map((device) => (
            <Badge
              key={device.id}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              <EyeOff className="h-3 w-3" />
              <span className="font-mono text-xs">{device.device_code}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => onRemoveDevice(device.id, device.device_code)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}