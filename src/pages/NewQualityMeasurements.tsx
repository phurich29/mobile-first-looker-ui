
import React, { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { BackgroundImage } from "@/components/graph-monitor/BackgroundImage";
import { Search, Wheat } from "lucide-react";
import { getMeasurementThaiName } from "@/utils/measurements";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/components/layouts"; // Import AppLayout

// All measurement types organized by category
const measurementTypes = {
  wholeGrain: [
    "class1", "class2", "class3", "short_grain", "slender_kernel"
  ],
  ingredients: [
    "whole_kernels", "head_rice", "total_brokens", "small_brokens", "small_brokens_c1"
  ],
  impurities: [
    "red_line_rate", "parboiled_red_line", "parboiled_white_rice", "honey_rice",
    "yellow_rice_rate", "black_kernel", "partly_black_peck", "partly_black",
    "imperfection_rate", "sticky_rice_rate", "impurity_num", "paddy_rate",
    "whiteness", "process_precision"
  ]
};

// A map of category names
const categoryNames = {
  wholeGrain: "เมล็ดข้าว",
  ingredients: "ส่วนประกอบ",
  impurities: "สิ่งเจือปน"
};

// Colors for each category
const categoryColors = {
  wholeGrain: "from-emerald-500 to-emerald-600",
  ingredients: "from-blue-500 to-blue-600",
  impurities: "from-purple-500 to-purple-600"
};

// Colors for each measurement type icon
const iconColors = {
  class1: "#F7931A",
  class2: "#627EEA",
  class3: "#F3BA2F",
  short_grain: "#23292F",
  slender_kernel: "#345D9D",
  whole_kernels: "#4CAF50",
  head_rice: "#2196F3",
  total_brokens: "#FF9800",
  small_brokens: "#9C27B0",
  small_brokens_c1: "#795548",
  red_line_rate: "#9b87f5",
  parboiled_red_line: "#7E69AB",
  parboiled_white_rice: "#6E59A5",
  honey_rice: "#D946EF",
  yellow_rice_rate: "#F3BA2F",
  black_kernel: "#1A1F2C",
  partly_black_peck: "#403E43",
  partly_black: "#221F26",
  imperfection_rate: "#F97316",
  sticky_rice_rate: "#0EA5E9",
  impurity_num: "#8B5CF6",
  paddy_rate: "#8E9196",
  whiteness: "#C8C8C9",
  process_precision: "#9F9EA1",
};

export default function NewQualityMeasurements() {
  const [searchTerm, setSearchTerm] = useState("");
  const isMobile = useIsMobile();
  // const [loading, setLoading] = useState(false); // loading state not used currently

  const filterMeasurements = (measurements: string[]) => {
    if (!searchTerm) return measurements;
    return measurements.filter(symbol => {
      const thaiName = getMeasurementThaiName(symbol);
      return thaiName?.toLowerCase().includes(searchTerm.toLowerCase());
    });
  };

  return (
    <AppLayout wideContent={true} showFooterNav={true} contentPaddingBottom={isMobile ? 'pb-16' : 'pb-6'}>
      <BackgroundImage />
      <div className="">
        <h1 className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mb-4">ค่าวัดคุณภาพ</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">เลือกค่าวัดคุณภาพที่ต้องการดูข้อมูลจากทุกอุปกรณ์</p>
        
        {/* Search Bar */}
        <div className="relative w-full mb-6">
          <input
            type="text"
            placeholder="ค้นหาค่าวัดคุณภาพ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-slate-400"
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500"
            width="16"
            height="16"
          />
        </div>

        {/* Measurement Categories */}
        {Object.entries(measurementTypes).map(([category, measurements]) => {
          const filteredMeasurements = filterMeasurements(measurements);
          if (filteredMeasurements.length === 0) return null;
          
          const categoryName = categoryNames[category as keyof typeof categoryNames];
          const gradientColor = categoryColors[category as keyof typeof categoryColors];
          
          return (
            <div key={category} className="mb-8">
              <div className="flex items-center mb-4">
                <div className={`h-6 w-1.5 rounded-full bg-gradient-to-b ${gradientColor} mr-2`}></div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{categoryName}</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {filteredMeasurements.map(symbol => {
                  const thaiName = getMeasurementThaiName(symbol);
                  const iconColor = iconColors[symbol as keyof typeof iconColors] || "#333333";
                  
                  return (
                    <Link
                      key={symbol}
                      to={`/measurement-detail/${symbol}`}
                      className="block"
                    >
                      <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 transition-shadow hover:border-emerald-300 dark:hover:border-emerald-600">
                        <div className="flex items-center">
                          <div 
                            className="h-10 w-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0 dark:border dark:border-slate-600"
                            style={{ backgroundColor: `${iconColor}25` }} // 15% opacity
                          >
                            <div 
                              className="h-5 w-5 rounded-full"
                              style={{ backgroundColor: iconColor }}
                            ></div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">{thaiName}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{symbol}</p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
        
        {/* Empty State */}
        {Object.values(measurementTypes).every(measurements => 
          filterMeasurements(measurements).length === 0
        ) && (
          <div className="py-10 text-center">
            <p className="text-gray-500 dark:text-gray-400">ไม่พบค่าวัดคุณภาพที่ตรงกับการค้นหา</p>
          </div>
        )}
      </div> {/* Closing the content wrapper div */}
    </AppLayout>
  );
}
