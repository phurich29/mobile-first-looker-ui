
import React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { TabsHeader, TabContent } from "./tabs";
import { useMeasurementTabs } from "../hooks/useMeasurementTabs";
import { NotificationSetting } from "../types";

interface MeasurementTabsProps {
  deviceCode: string | undefined;
  searchTerm: string;
  wholeGrainData: any[] | null;
  ingredientsData: any[] | null;
  impuritiesData: any[] | null;
  allData: any[] | null;
  notificationSettings: NotificationSetting[];
  isLoadingWholeGrain: boolean;
  isLoadingIngredients: boolean;
  isLoadingImpurities: boolean;
  isLoadingAllData: boolean;
  onMeasurementClick: (symbol: string, name: string) => void;
}

export const MeasurementTabs: React.FC<MeasurementTabsProps> = ({
  deviceCode,
  searchTerm,
  wholeGrainData,
  ingredientsData,
  impuritiesData,
  allData,
  notificationSettings,
  isLoadingWholeGrain,
  isLoadingIngredients,
  isLoadingImpurities,
  isLoadingAllData,
  onMeasurementClick
}) => {
  // Use our custom hook to manage the tabs state and data
  const {
    activeTab,
    setActiveTab,
    wholeGrainItems,
    ingredientItems,
    impuritiesItems,
    filteredItems,
  } = useMeasurementTabs({
    deviceCode,
    searchTerm,
    wholeGrainData,
    ingredientsData,
    impuritiesData,
    notificationSettings,
  });

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsHeader activeTab={activeTab} />
      
      <TabContent 
        value="wholegrain"
        items={wholeGrainItems}
        isLoading={isLoadingWholeGrain}
        deviceCode={deviceCode}
        onMeasurementClick={onMeasurementClick}
        searchTerm={searchTerm}
      />
      
      <TabContent 
        value="ingredients"
        items={ingredientItems}
        isLoading={isLoadingIngredients}
        deviceCode={deviceCode}
        onMeasurementClick={onMeasurementClick}
        searchTerm={searchTerm}
      />
      
      <TabContent 
        value="impurities"
        items={impuritiesItems}
        isLoading={isLoadingImpurities}
        deviceCode={deviceCode}
        onMeasurementClick={onMeasurementClick}
        searchTerm={searchTerm}
      />
      
      <TabContent 
        value="all"
        items={filteredItems}
        isLoading={isLoadingAllData}
        deviceCode={deviceCode}
        onMeasurementClick={onMeasurementClick}
        searchTerm={searchTerm}
      />
    </Tabs>
  );
};
