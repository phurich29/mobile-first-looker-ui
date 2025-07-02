import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EyeOff } from "lucide-react";
import { DeviceVisibilityManagementProps } from "./types";
import { useDeviceVisibility } from "./hooks/useDeviceVisibility";
import { DeviceVisibilityForm } from "./components/DeviceVisibilityForm";
import { HiddenDevicesList } from "./components/HiddenDevicesList";
import { UsageInstructions } from "./components/UsageInstructions";
import { LoadingState } from "./components/LoadingState";

export function DeviceVisibilityManagement({ isAdmin, isSuperAdmin }: DeviceVisibilityManagementProps) {
  // Only show for superadmin only
  if (!isSuperAdmin) {
    return null;
  }

  const {
    hiddenDevices,
    newDeviceCode,
    setNewDeviceCode,
    isLoading,
    isAddingDevice,
    addHiddenDevice,
    removeHiddenDevice
  } = useDeviceVisibility();

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <Card className="dark:bg-slate-800 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold dark:text-gray-100 flex items-center gap-2">
          <EyeOff className="h-5 w-5" />
          การควบคุมการแสดงผลอุปกรณ์ (Super Admin เท่านั้น)
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          จัดการรหัสอุปกรณ์ที่ต้องการซ่อนจากการแสดงผลสำหรับ Admin (เฉพาะ Super Admin เท่านั้นที่สามารถควบคุมได้)
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <DeviceVisibilityForm
          newDeviceCode={newDeviceCode}
          setNewDeviceCode={setNewDeviceCode}
          onAddDevice={addHiddenDevice}
          isAddingDevice={isAddingDevice}
        />

        <HiddenDevicesList
          hiddenDevices={hiddenDevices}
          onRemoveDevice={removeHiddenDevice}
        />

        <UsageInstructions />
      </CardContent>
    </Card>
  );
}