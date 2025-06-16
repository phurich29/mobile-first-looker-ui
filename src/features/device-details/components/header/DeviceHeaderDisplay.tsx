
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { LineChart } from "lucide-react";

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
    <div className="relative">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
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
        
        {deviceCode && deviceCode !== 'default' && (
          <div className="mt-2 md:mt-0 md:ml-5">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full md:w-auto text-xs py-1 h-7 flex items-center gap-1.5 bg-white hover:bg-gray-50 border-gray-200"
              onClick={() => {
                // TODO: Implement chart display logic
                console.log('Show device on chart:', deviceCode);
              }}
            >
              <LineChart className="h-3.5 w-3.5" />
              <span>Show on chart</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
