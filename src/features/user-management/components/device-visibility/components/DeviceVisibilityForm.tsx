import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

interface DeviceVisibilityFormProps {
  newDeviceCode: string;
  setNewDeviceCode: (value: string) => void;
  onAddDevice: () => void;
  isAddingDevice: boolean;
}

export function DeviceVisibilityForm({
  newDeviceCode,
  setNewDeviceCode,
  onAddDevice,
  isAddingDevice
}: DeviceVisibilityFormProps) {
  return (
    <div className="flex gap-2">
      <Input
        placeholder="รหัสอุปกรณ์ที่ต้องการซ่อน เช่น 6400000401493"
        value={newDeviceCode}
        onChange={(e) => setNewDeviceCode(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            onAddDevice();
          }
        }}
        className="flex-1"
      />
      <Button
        onClick={onAddDevice}
        disabled={isAddingDevice || !newDeviceCode.trim()}
        variant="outline"
        size="sm"
      >
        <Plus className="h-4 w-4 mr-1" />
        เพิ่ม
      </Button>
    </div>
  );
}