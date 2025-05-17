
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MeasurementList } from "./MeasurementList";
import { TabsHeader } from "./tabs";
import { NotificationSetting } from "../types";
import { 
  formatWholeGrainItems, 
  formatIngredientItems,
  formatImpuritiesItems 
} from "../utils/measurementFormatters";

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
  const [activeTab, setActiveTab] = useState("wholegrain");

  // Function to get notification settings for a measurement
  const getNotificationSetting = useCallback((symbol: string) => {
    const setting = notificationSettings.find(s => s.rice_type_id === symbol);
    if (!setting) return null;
    
    // Determine notification type
    let type: 'min' | 'max' | 'both' = 'both';
    if (setting.min_enabled && !setting.max_enabled) type = 'min';
    else if (!setting.min_enabled && setting.max_enabled) type = 'max';
    
    // Format threshold
    let threshold = '';
    if (type === 'min') threshold = String(setting.min_threshold);
    else if (type === 'max') threshold = String(setting.max_threshold);
    else threshold = `${setting.min_threshold} - ${setting.max_threshold}`;
    
    return {
      enabled: setting.enabled,
      type,
      threshold
    };
  }, [notificationSettings]);

  // Generate formatted data for all measurement types
  const wholeGrainItems = useMemo(() => 
    formatWholeGrainItems(wholeGrainData, deviceCode, getNotificationSetting), 
    [wholeGrainData, deviceCode, getNotificationSetting]
  );

  const ingredientItems = useMemo(() => 
    formatIngredientItems(ingredientsData, deviceCode, getNotificationSetting),
    [ingredientsData, deviceCode, getNotificationSetting]
  );

  const impuritiesItems = useMemo(() =>
    formatImpuritiesItems(impuritiesData, deviceCode, getNotificationSetting),
    [impuritiesData, deviceCode, getNotificationSetting]
  );

  // Generate formatted data for all measurements
  const allItems = useMemo(() => {
    return [...wholeGrainItems, ...ingredientItems, ...impuritiesItems];
  }, [wholeGrainItems, ingredientItems, impuritiesItems]);

  // Filter items based on search term
  const filteredItems = useMemo(() => {
    if (!searchTerm) return allItems;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return allItems.filter(item => 
      item.name.toLowerCase().includes(lowerSearchTerm) || 
      item.symbol.toLowerCase().includes(lowerSearchTerm)
    );
  }, [searchTerm, allItems]);

  // Set active tab based on data availability
  useEffect(() => {
    if (searchTerm) {
      setActiveTab("all");
    } else if (wholeGrainData && wholeGrainData.length > 0) {
      setActiveTab("wholegrain");
    } else if (ingredientsData && ingredientsData.length > 0) {
      setActiveTab("ingredients");
    } else if (impuritiesData && impuritiesData.length > 0) {
      setActiveTab("impurities");
    }
  }, [wholeGrainData, ingredientsData, impuritiesData, searchTerm]);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsHeader activeTab={activeTab} />

      <TabsContent value="wholegrain" className="space-y-4">
        <MeasurementList
          items={wholeGrainItems}
          isLoading={isLoadingWholeGrain}
          deviceCode={deviceCode}
          onMeasurementClick={onMeasurementClick}
        />
      </TabsContent>
      
      <TabsContent value="ingredients" className="space-y-4">
        <MeasurementList
          items={ingredientItems}
          isLoading={isLoadingIngredients}
          deviceCode={deviceCode}
          onMeasurementClick={onMeasurementClick}
        />
      </TabsContent>
      
      <TabsContent value="impurities" className="space-y-4">
        <MeasurementList
          items={impuritiesItems}
          isLoading={isLoadingImpurities}
          deviceCode={deviceCode}
          onMeasurementClick={onMeasurementClick}
        />
      </TabsContent>
      
      <TabsContent value="all" className="space-y-4">
        <MeasurementList
          items={filteredItems}
          isLoading={isLoadingAllData}
          deviceCode={deviceCode}
          onMeasurementClick={onMeasurementClick}
        />
      </TabsContent>
    </Tabs>
  );
};
