
import { MeasurementItem } from "../deviceMeasurementUtils";
import { calculateChange } from "./formatters";

// Format impurities measurements
export const formatImpuritiesItems = (impuritiesData: any[] | null): MeasurementItem[] => {
  if (!impuritiesData || impuritiesData.length === 0) return [];
  
  const latestData = impuritiesData[0];
  const previousData = impuritiesData.length > 1 ? impuritiesData[1] : null;
  
  return [
    {
      symbol: "red_line_rate",
      name: "สีต่ำกว่ามาตรฐาน",
      price: latestData.red_line_rate?.toString() || "0",
      percentageChange: calculateChange(latestData.red_line_rate, previousData?.red_line_rate),
      iconColor: "#9b87f5",
      updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
    },
    {
      symbol: "parboiled_red_line",
      name: "เมล็ดแดง",
      price: latestData.parboiled_red_line?.toString() || "0",
      percentageChange: calculateChange(latestData.parboiled_red_line, previousData?.parboiled_red_line),
      iconColor: "#7E69AB",
      updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
    },
    {
      symbol: "parboiled_white_rice",
      name: "ข้าวดิบ",
      price: latestData.parboiled_white_rice?.toString() || "0",
      percentageChange: calculateChange(latestData.parboiled_white_rice, previousData?.parboiled_white_rice),
      iconColor: "#6E59A5",
      updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
    },
    {
      symbol: "honey_rice",
      name: "เมล็ดม่วง",
      price: latestData.honey_rice?.toString() || "0",
      percentageChange: calculateChange(latestData.honey_rice, previousData?.honey_rice),
      iconColor: "#D946EF",
      updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
    },
    {
      symbol: "yellow_rice_rate",
      name: "เมล็ดข้าวสีเหลือง",
      price: latestData.yellow_rice_rate?.toString() || "0",
      percentageChange: calculateChange(latestData.yellow_rice_rate, previousData?.yellow_rice_rate),
      iconColor: "#F3BA2F",
      updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
    },
    {
      symbol: "black_kernel",
      name: "เมล็ดดำ",
      price: latestData.black_kernel?.toString() || "0",
      percentageChange: calculateChange(latestData.black_kernel, previousData?.black_kernel),
      iconColor: "#1A1F2C",
      updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
    },
    {
      symbol: "partly_black_peck",
      name: "ดำบางส่วน & จุดดำ",
      price: latestData.partly_black_peck?.toString() || "0",
      percentageChange: calculateChange(latestData.partly_black_peck, previousData?.partly_black_peck),
      iconColor: "#403E43",
      updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
    },
    {
      symbol: "partly_black",
      name: "ดำบางส่วน",
      price: latestData.partly_black?.toString() || "0",
      percentageChange: calculateChange(latestData.partly_black, previousData?.partly_black),
      iconColor: "#221F26",
      updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
    },
    {
      symbol: "imperfection_rate",
      name: "เมล็ดเสีย",
      price: latestData.imperfection_rate?.toString() || "0",
      percentageChange: calculateChange(latestData.imperfection_rate, previousData?.imperfection_rate),
      iconColor: "#F97316",
      updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
    },
    {
      symbol: "sticky_rice_rate",
      name: "ข้าวเหนียว",
      price: latestData.sticky_rice_rate?.toString() || "0",
      percentageChange: calculateChange(latestData.sticky_rice_rate, previousData?.sticky_rice_rate),
      iconColor: "#0EA5E9",
      updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
    },
    {
      symbol: "impurity_num",
      name: "เมล็ดอื่นๆ",
      price: latestData.impurity_num?.toString() || "0",
      percentageChange: calculateChange(latestData.impurity_num, previousData?.impurity_num),
      iconColor: "#8B5CF6",
      updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
    },
    {
      symbol: "paddy_rate",
      name: "ข้าวเปลือก(เมล็ด/กก.)",
      price: latestData.paddy_rate?.toString() || "0",
      percentageChange: calculateChange(latestData.paddy_rate, previousData?.paddy_rate),
      iconColor: "#8E9196",
      updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
    },
    {
      symbol: "whiteness",
      name: "ความขาว",
      price: latestData.whiteness?.toString() || "0",
      percentageChange: calculateChange(latestData.whiteness, previousData?.whiteness),
      iconColor: "#C8C8C9",
      updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
    },
    {
      symbol: "process_precision",
      name: "ระดับขัดสี",
      price: latestData.process_precision?.toString() || "0",
      percentageChange: calculateChange(latestData.process_precision, previousData?.process_precision),
      iconColor: "#9F9EA1",
      updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
    }
  ];
};
