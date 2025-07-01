
import { MeasurementItem } from "../deviceMeasurementUtils";
import { calculateChange } from "./formatters";

// Format ingredients measurements
export const formatIngredientsItems = (ingredientsData: any[] | null): MeasurementItem[] => {
  if (!ingredientsData || ingredientsData.length === 0) return [];
  
  const latestData = ingredientsData[0];
  const previousData = ingredientsData.length > 1 ? ingredientsData[1] : null;
  
  return [
    {
      symbol: "whole_kernels",
      name: "เต็มเมล็ด",
      price: latestData.whole_kernels?.toString() || "0",
      percentageChange: calculateChange(latestData.whole_kernels, previousData?.whole_kernels),
      iconColor: "#4CAF50",
      updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
    },
    {
      symbol: "head_rice",
      name: "หัวข้าว",
      price: latestData.head_rice?.toString() || "0",
      percentageChange: calculateChange(latestData.head_rice, previousData?.head_rice),
      iconColor: "#2196F3",
      updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
    },
    {
      symbol: "total_brokens",
      name: "ข้าวหักรวม",
      price: latestData.total_brokens?.toString() || "0",
      percentageChange: calculateChange(latestData.total_brokens, previousData?.total_brokens),
      iconColor: "#FF9800",
      updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
    },
    {
      symbol: "small_brokens",
      name: "ปลายข้าว",
      price: latestData.small_brokens?.toString() || "0",
      percentageChange: calculateChange(latestData.small_brokens, previousData?.small_brokens),
      iconColor: "#9C27B0",
      updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
    },
    {
      symbol: "small_brokens_c1",
      name: "ปลายข้าวC1",
      price: latestData.small_brokens_c1?.toString() || "0",
      percentageChange: calculateChange(latestData.small_brokens_c1, previousData?.small_brokens_c1),
      iconColor: "#795548",
      updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
    }
  ];
};
