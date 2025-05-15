
import React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import TabsContainer from "@/components/device-management/TabsContainer";
import { MeasurementList } from "./MeasurementList";
import { 
  formatWholeGrainItems,
  formatIngredientsItems,
  formatImpuritiesItems,
  formatAllItems
} from "@/utils/measurementFormatters";

interface MeasurementTabsProps {
  deviceCode: string | undefined;
  searchTerm: string;
  wholeGrainData: any;
  ingredientsData: any;
  impuritiesData: any;
  allData: any;
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
  isLoadingWholeGrain,
  isLoadingIngredients,
  isLoadingImpurities,
  isLoadingAllData,
  onMeasurementClick
}) => {
  // Filter data based on search term
  const filterData = (items: any[]) => {
    if (!searchTerm.trim()) return items;
    
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.price.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsContainer />
      
      <TabsContent value="all" className="mt-4">
        <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 mb-8 hover:shadow-xl transition-shadow">
          <MeasurementList
            items={filterData(formatAllItems(allData))}
            isLoading={isLoadingAllData}
            deviceCode={deviceCode}
            onMeasurementClick={onMeasurementClick}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="wholegrain" className="mt-4">
        <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 mb-8 hover:shadow-xl transition-shadow">
          <MeasurementList
            items={filterData(formatWholeGrainItems(wholeGrainData))}
            isLoading={isLoadingWholeGrain}
            deviceCode={deviceCode}
            onMeasurementClick={onMeasurementClick}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="ingredients" className="mt-4">
        <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 mb-8 hover:shadow-xl transition-shadow">
          <MeasurementList
            items={filterData(formatIngredientsItems(ingredientsData))}
            isLoading={isLoadingIngredients}
            deviceCode={deviceCode}
            onMeasurementClick={onMeasurementClick}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="impurities" className="mt-4">
        <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 mb-8 hover:shadow-xl transition-shadow">
          <MeasurementList
            items={filterData(formatImpuritiesItems(impuritiesData))}
            isLoading={isLoadingImpurities}
            deviceCode={deviceCode}
            onMeasurementClick={onMeasurementClick}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
};
