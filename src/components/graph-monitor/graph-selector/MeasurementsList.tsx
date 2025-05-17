
import React, { useState } from "react";
import { MeasurementCard } from "./MeasurementCard";
import { Skeleton } from "@/components/ui/skeleton";
import { SelectedGraph } from "../types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface MeasurementData {
  symbol: string;
  name: string;
  value?: any;
}

interface MeasurementsListProps {
  measurements: MeasurementData[];
  loading: boolean;
  deviceCode: string | null;
  deviceName: string;
  onSelectMeasurement: (symbol: string, name: string) => void;
}

export const MeasurementsList: React.FC<MeasurementsListProps> = ({
  measurements,
  loading,
  deviceCode,
  deviceName,
  onSelectMeasurement
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {Array(9).fill(0).map((_, i) => (
          <div key={i} className="flex items-center p-3 mb-2">
            <Skeleton className="h-10 w-10 rounded-full mr-3" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (measurements.length === 0) {
    return (
      <p className="text-center text-gray-500 py-4">
        ไม่พบค่าคุณภาพที่ตรงกับการค้นหา
      </p>
    );
  }
  
  // แบ่งกลุ่มค่าที่ต้องการวัดตามข้อมูลในหน้า "ค่าวัดคุณภาพ"
  const wholeGrainSymbols = ['class1', 'class2', 'class3', 'short_grain', 'slender_kernel'];
  const ingredientsSymbols = ['whole_kernels', 'head_rice', 'total_brokens', 'small_brokens', 'small_brokens_c1'];
  const impuritiesSymbols = [
    'red_line_rate', 'parboiled_red_line', 'parboiled_white_rice', 'honey_rice',
    'yellow_rice_rate', 'black_kernel', 'partly_black_peck', 'partly_black',
    'imperfection_rate', 'sticky_rice_rate'
  ];

  // กรองค่าที่ไม่ต้องการแสดงออก (simple_index และ Output)
  const filteredMeasurements = measurements.filter(m => 
    m.symbol !== 'simple_index' && 
    m.symbol !== 'Output'
  );

  // จัดกลุ่มค่าที่ต้องการวัด
  const wholeGrainMeasurements = filteredMeasurements.filter(m => wholeGrainSymbols.includes(m.symbol));
  const ingredientsMeasurements = filteredMeasurements.filter(m => ingredientsSymbols.includes(m.symbol));
  const impuritiesMeasurements = filteredMeasurements.filter(m => impuritiesSymbols.includes(m.symbol));

  // สร้าง section แสดงกลุ่มของค่าที่ต้องการวัด
  const renderMeasurementGroup = (measurements: MeasurementData[]) => {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {measurements.map((measurement) => (
          <MeasurementCard
            key={measurement.symbol}
            measurement={measurement}
            onClick={() => onSelectMeasurement(measurement.symbol, measurement.name)}
          />
        ))}
      </div>
    );
  };

  return (
    <Tabs defaultValue="wholegrain" className="w-full">
      <TabsList className="mb-4 w-full flex">
        <TabsTrigger value="wholegrain" className="flex-1">พื้นข้าวเต็มเมล็ด</TabsTrigger>
        <TabsTrigger value="ingredients" className="flex-1">ส่วนผสม</TabsTrigger>
        <TabsTrigger value="impurities" className="flex-1">สิ่งเจือปน</TabsTrigger>
      </TabsList>
      
      <TabsContent value="wholegrain" className="mt-2">
        {wholeGrainMeasurements.length > 0 ? (
          renderMeasurementGroup(wholeGrainMeasurements)
        ) : (
          <p className="text-center text-gray-500 py-4">ไม่พบค่าคุณภาพในหมวดนี้</p>
        )}
      </TabsContent>
      
      <TabsContent value="ingredients" className="mt-2">
        {ingredientsMeasurements.length > 0 ? (
          renderMeasurementGroup(ingredientsMeasurements)
        ) : (
          <p className="text-center text-gray-500 py-4">ไม่พบค่าคุณภาพในหมวดนี้</p>
        )}
      </TabsContent>
      
      <TabsContent value="impurities" className="mt-2">
        {impuritiesMeasurements.length > 0 ? (
          renderMeasurementGroup(impuritiesMeasurements)
        ) : (
          <p className="text-center text-gray-500 py-4">ไม่พบค่าคุณภาพในหมวดนี้</p>
        )}
      </TabsContent>

    </Tabs>
  );
};
