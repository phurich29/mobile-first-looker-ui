
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SortOption = "device_code" | "display_name" | "updated_at";

interface DevicesSortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export function DevicesSortDropdown({ value, onChange }: DevicesSortDropdownProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        จัดเรียง:
      </span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-40 h-8 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
          <SelectItem value="device_code" className="text-sm">
            รหัสอุปกรณ์
          </SelectItem>
          <SelectItem value="display_name" className="text-sm">
            ชื่ออุปกรณ์
          </SelectItem>
          <SelectItem value="updated_at" className="text-sm">
            อัพเดทล่าสุด
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
