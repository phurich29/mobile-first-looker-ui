import React, { useState } from "react";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { Search, Server } from "lucide-react";
import { getMeasurementThaiName } from "@/utils/measurements";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [loading, setLoading] = useState(false);

  // Filter measurements based on search term
  const filterMeasurements = (measurements: string[]) => {
    if (!searchTerm) return measurements;
    
    return measurements.filter(symbol => {
      const thaiName = getMeasurementThaiName(symbol);
      return thaiName?.toLowerCase().includes(searchTerm.toLowerCase());
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64">
      <Header />

      <main className="flex-1 p-4 pb-32">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <h1 className="text-2xl font-bold text-emerald-800 mb-4">ค่าวัดคุณภาพ</h1>
          <p className="text-gray-600 mb-6">เลือกค่าวัดคุณภาพที่ต้องการดูข้อมูลจากทุกอุปกรณ์</p>
          
          {/* Search Bar */}
          <div className="relative w-full mb-6">
            <input
              type="text"
              placeholder="ค้นหาค่าวัดคุณภาพ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
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
                  <h2 className="text-lg font-semibold text-gray-800">{categoryName}</h2>
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
                        <Card className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow hover:border-emerald-300">
                          <div className="flex items-center">
                            <div 
                              className="h-10 w-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
                              style={{ backgroundColor: `${iconColor}25` }} // 25 is hex for 15% opacity
                            >
                              <div 
                                className="h-5 w-5 rounded-full"
                                style={{ backgroundColor: iconColor }}
                              ></div>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-800">{thaiName}</h3>
                              <p className="text-xs text-gray-500">{symbol}</p>
                            </div>
                            <div className="text-emerald-600 flex items-center">
                              <Server className="h-5 w-5" />
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
              <p className="text-gray-500">ไม่พบค่าวัดคุณภาพที่ตรงกับการค้นหา</p>
            </div>
          )}
        </div>
      </main>

      {/* Add space to prevent content from being hidden behind footer */}
      <div className="pb-32"></div>

      {/* Footer navigation */}
      <FooterNav />
    </div>
  );
}
