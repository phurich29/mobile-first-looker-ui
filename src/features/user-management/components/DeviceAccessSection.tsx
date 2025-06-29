
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface Device {
  device_code: string;
  display_name?: string;
}

interface DeviceAccessSectionProps {
  availableDevices: Device[];
  userDevices: string[];
  isLoadingDevices: boolean;
  onGrantAccess: (deviceCode: string) => void;
  onRevokeAccess: (deviceCode: string) => void;
}

export function DeviceAccessSection({
  availableDevices,
  userDevices,
  isLoadingDevices,
  onGrantAccess,
  onRevokeAccess
}: DeviceAccessSectionProps) {
  if (isLoadingDevices) {
    return (
      <div className="text-xs text-gray-500 dark:text-gray-400">กำลังโหลดข้อมูลอุปกรณ์...</div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Current devices */}
      <div>
        <label className="text-xs text-gray-600 dark:text-gray-400">อุปกรณ์ที่มีสิทธิ์เข้าถึง:</label>
        <div className="mt-1 space-y-1 max-h-32 overflow-y-auto">
          {userDevices.length === 0 ? (
            <div className="text-xs text-gray-500 dark:text-gray-400 italic">ไม่มีอุปกรณ์ที่ได้รับสิทธิ์</div>
          ) : (
            userDevices.map(deviceCode => {
              const device = availableDevices.find(d => d.device_code === deviceCode);
              const displayName = device?.display_name || deviceCode;
              
              return (
                <div key={deviceCode} className="flex items-center justify-between bg-gray-100 dark:bg-slate-600 rounded px-2 py-1">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium dark:text-gray-200">{displayName}</span>
                    {device?.display_name && (
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">{deviceCode}</span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRevokeAccess(deviceCode)}
                    className="h-5 w-5 p-0 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Available devices to add */}
      <div>
        <label className="text-xs text-gray-600 dark:text-gray-400">เพิ่มอุปกรณ์:</label>
        <div className="mt-1 space-y-1 max-h-32 overflow-y-auto">
          {availableDevices
            .filter(device => !userDevices.includes(device.device_code))
            .map(device => {
              const displayName = device.display_name || device.device_code;
              
              return (
                <div key={device.device_code} className="flex items-center justify-between bg-gray-50 dark:bg-slate-700 rounded px-2 py-1">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium dark:text-gray-200">{displayName}</span>
                    {device.display_name && (
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">{device.device_code}</span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onGrantAccess(device.device_code)}
                    className="h-5 w-5 p-0 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              );
            })
          }
          {availableDevices.filter(device => !userDevices.includes(device.device_code)).length === 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400 italic">ไม่มีอุปกรณ์เพิ่มเติมให้เพิ่ม</div>
          )}
        </div>
      </div>
    </div>
  );
}
