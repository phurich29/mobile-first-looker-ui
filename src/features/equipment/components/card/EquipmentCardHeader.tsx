
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

interface EquipmentCardHeaderProps {
  deviceCode: string;
  displayName?: string;
  isSuperAdmin: boolean;
  onUsersClick: () => void;
}

export function EquipmentCardHeader({
  deviceCode,
  displayName,
  isSuperAdmin,
  onUsersClick
}: EquipmentCardHeaderProps) {
  return (
    <CardHeader className="pb-1 p-2 sm:p-4">
      <div className="flex flex-row items-start gap-2 sm:gap-3">
        {/* Column 1: Icon */}
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 sm:mt-0">
          <img src="/lovable-uploads/62fc5c00-ac5d-4eed-b226-0a5cb16781f6.png" alt="อุปกรณ์" className="w-full h-full object-contain" />
        </div>

        {/* Column 2: Text details and Badge */}
        <div className="flex-grow min-w-0">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-bold text-gray-900 dark:text-white truncate">
              {displayName || deviceCode}
            </CardTitle>
            {isSuperAdmin && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 ml-1 flex-shrink-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={onUsersClick}
                title="จัดการสิทธิ์การเข้าถึงอุปกรณ์"
              >
                <Users className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0 sm:mt-0.5 truncate">
            รหัส: {deviceCode}
          </div>
        </div>
      </div>
    </CardHeader>
  );
}
