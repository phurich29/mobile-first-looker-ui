
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface DeviceHeaderDisplayProps {
  displayName: string | null;
  deviceCode: string | undefined;
}

export const DeviceHeaderDisplay: React.FC<DeviceHeaderDisplayProps> = ({
  displayName,
  deviceCode
}) => {
  const isMobile = useIsMobile();

  return (
    <div>
      <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>
        {displayName || deviceCode}
      </h1>
      {displayName && (
        <p className="text-xs text-gray-500 mt-1">
          รหัสอุปกรณ์: {deviceCode}
        </p>
      )}
      <p className="text-xs text-gray-500 mt-1">
        รายละเอียดข้อมูลการวัด
      </p>
    </div>
  );
};
