
import { MeasurementItem } from "../deviceMeasurementUtils";
import { calculateChange } from "./formatters";

// Format whole grain measurements
export const formatWholeGrainItems = (wholeGrainData: any[] | null): MeasurementItem[] => {
  if (!wholeGrainData || wholeGrainData.length === 0) return [];
  
  // Calculate the changes between latest and previous data
  const latestData = wholeGrainData[0];
  const previousData = wholeGrainData.length > 1 ? wholeGrainData[1] : null;
  
  // Format the data for display
  return [
    {
      symbol: "class1",
      name: "ชั้น 1 (>7.0mm)",
      price: latestData.class1?.toString() || "0",
      percentageChange: calculateChange(latestData.class1, previousData?.class1),
      iconColor: "#F7931A",
      updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
    },
    {
      symbol: "class2",
      name: "ชั้น 2 (>6.6-7.0mm)",
      price: latestData.class2?.toString() || "0",
      percentageChange: calculateChange(latestData.class2, previousData?.class2),
      iconColor: "#627EEA",
      updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
    },
    {
      symbol: "class3",
      name: "ชั้น 3 (>6.2-6.6mm)",
      price: latestData.class3?.toString() || "0",
      percentageChange: calculateChange(latestData.class3, previousData?.class3),
      iconColor: "#F3BA2F",
      updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
    },
    {
      symbol: "short_grain",
      name: "เมล็ดสั้น",
      price: latestData.short_grain?.toString() || "0",
      percentageChange: calculateChange(latestData.short_grain, previousData?.short_grain),
      iconColor: "#23292F",
      updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
    },
    {
      symbol: "slender_kernel",
      name: "ข้าวลีบ",
      price: latestData.slender_kernel?.toString() || "0",
      percentageChange: calculateChange(latestData.slender_kernel, previousData?.slender_kernel),
      iconColor: "#345D9D",
      updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
    },
  ];
};
