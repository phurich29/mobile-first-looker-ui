
import React from "react";
import { TabsContent as UITabsContent } from "@/components/ui/tabs";
import { MeasurementList } from "../MeasurementList";
import { MeasurementItem } from "../../types";

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
  return (
    <UITabsContent value={value} className="space-y-4">
      <MeasurementList
        items={items}
        isLoading={isLoading}
        deviceCode={deviceCode}
        onMeasurementClick={onMeasurementClick}
      />
    </UITabsContent>
  );
};
