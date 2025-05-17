
import React from "react";
import { TabsContent as UITabsContent } from "@/components/ui/tabs";
import { MeasurementList } from "../MeasurementList";
import { MeasurementItem } from "../../types";
import { useDeviceContext } from "@/contexts/DeviceContext";
import { Pin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TabContentProps {
  value: string;
  items: MeasurementItem[];
  isLoading: boolean;
  deviceCode: string | undefined;
  onMeasurementClick: (symbol: string, name: string) => void;
}

export const TabContent: React.FC<TabContentProps> = ({
  value,
  items,
  isLoading,
  deviceCode,
  onMeasurementClick
}) => {
  const { selectedDevice } = useDeviceContext();
  const isSelectedDevice = selectedDevice === deviceCode;
  
  return (
    <UITabsContent value={value} className="space-y-4">
      {isSelectedDevice && (
        <div className="flex items-center mb-2">
          <Badge variant="outline" className="flex items-center gap-1 text-blue-600 border-blue-200 bg-blue-50">
            <Pin className="h-3 w-3" />
            <span>อุปกรณ์ที่เลือก</span>
          </Badge>
        </div>
      )}
      <MeasurementList
        items={items}
        isLoading={isLoading}
        deviceCode={deviceCode}
        onMeasurementClick={onMeasurementClick}
      />
    </UITabsContent>
  );
};
