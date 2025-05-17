
import React from "react";
import { TabsContent as UITabsContent } from "@/components/ui/tabs";
import { MeasurementList } from "../MeasurementList";
import { MeasurementItem } from "../../types";
import { filterMeasurementsBySearchTerm } from "../../utils/searchUtils";

interface TabContentProps {
  value: string;
  items: MeasurementItem[];
  isLoading: boolean;
  deviceCode: string | undefined;
  onMeasurementClick: (symbol: string, name: string) => void;
  searchTerm?: string;
}

export const TabContent: React.FC<TabContentProps> = ({
  value,
  items,
  isLoading,
  deviceCode,
  onMeasurementClick,
  searchTerm = ""
}) => {
  // Filter items based on search term
  const filteredItems = filterMeasurementsBySearchTerm(items, searchTerm);
  
  return (
    <UITabsContent value={value} className="space-y-4">
      <MeasurementList
        items={filteredItems}
        isLoading={isLoading}
        deviceCode={deviceCode}
        onMeasurementClick={onMeasurementClick}
      />
    </UITabsContent>
  );
};
