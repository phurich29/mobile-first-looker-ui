
import { useState, useEffect, useMemo } from "react";
import { MeasurementItem } from "../types";
import { 
  formatWholeGrainItems, 
  formatIngredientItems,
  formatImpuritiesItems 
} from "../utils/measurementFormatters";
import { filterMeasurementsBySearchTerm } from "../utils/searchUtils";
import { useNotificationSettings } from "./useNotificationSettings";

interface UseMeasurementTabsProps {
  deviceCode: string | undefined;
  searchTerm: string;
  wholeGrainData: any[] | null;
  ingredientsData: any[] | null;
  impuritiesData: any[] | null;
  notificationSettings: any[];
}

export const useMeasurementTabs = ({
  deviceCode,
  searchTerm,
  wholeGrainData,
  ingredientsData,
  impuritiesData,
  notificationSettings
}: UseMeasurementTabsProps) => {
  const [activeTab, setActiveTab] = useState("wholegrain");
  
  // Get notification settings function
  const { getNotificationSetting } = useNotificationSettings(notificationSettings);

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
  const filteredItems = useMemo(() => 
    filterMeasurementsBySearchTerm(allItems, searchTerm),
    [searchTerm, allItems]
  );

  // Set active tab based on data availability and search
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

  return {
    activeTab,
    setActiveTab,
    wholeGrainItems,
    ingredientItems,
    impuritiesItems,
    filteredItems,
  };
};
