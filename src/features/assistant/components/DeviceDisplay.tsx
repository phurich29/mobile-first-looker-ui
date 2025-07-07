import { useAssistant } from "@/features/assistant/context/AssistantContext";
import { useAuth } from "@/components/AuthProvider";
import { EquipmentCard } from "@/features/equipment/components/EquipmentCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export function DeviceDisplay() {
  const { userRoles } = useAuth();
  const {
    devices,
    isLoading: devicesLoading,
    handleRefresh,
    selectedDeviceCode,
    setSelectedDeviceCode,
    selectedDevice,
  } = useAssistant();

  const isAdmin = userRoles.includes("admin");
  const isSuperAdmin = userRoles.includes("superadmin");

  return (
    <div className="space-y-4 my-4">
      <div>
        <label
          htmlFor="device-selector"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          เลือกอุปกรณ์เพื่อดูข้อมูล
        </label>
        {devicesLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Select
            value={selectedDeviceCode}
            onValueChange={(value) => setSelectedDeviceCode(value || "")}
          >
            <SelectTrigger id="device-selector" className="w-full">
              <SelectValue placeholder="เลือกอุปกรณ์..." />
            </SelectTrigger>
            <SelectContent>
              {devices.length > 0 ? (
                devices.map((device) => (
                  <SelectItem
                    key={device.device_code}
                    value={device.device_code}
                  >
                    {device.display_name || device.device_code}
                  </SelectItem>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-gray-500">
                  ไม่พบอุปกรณ์
                </div>
              )}
            </SelectContent>
          </Select>
        )}
      </div>

      {selectedDevice && (
        <div className="p-2 bg-white/20 rounded-lg">
          <EquipmentCard
            deviceCode={selectedDevice.device_code}
            lastUpdated={selectedDevice.updated_at}
            isAdmin={isAdmin}
            isSuperAdmin={isSuperAdmin}
            displayName={selectedDevice.display_name}
            onDeviceUpdated={handleRefresh}
            deviceData={selectedDevice.deviceData}
          />
        </div>
      )}
    </div>
  );
}
