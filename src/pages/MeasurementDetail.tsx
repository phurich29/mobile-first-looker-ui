
import React from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { getMeasurementThaiName } from "@/utils/measurements";

// Import refactored components and hooks
import {
  useMeasurementDeviceData,
  MeasurementHeader,
  DeviceCardList
} from "@/features/measurement-detail";

export default function MeasurementDetail() {
  const { measurementSymbol } = useParams<{ measurementSymbol: string }>();
  const measurementName = getMeasurementThaiName(measurementSymbol || "");
  
  // Use the custom hook to fetch device data
  const { isLoading, devices } = useMeasurementDeviceData(measurementSymbol);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64">
      <Header />

      <main className="flex-1 p-4 pb-32">
        <MeasurementHeader 
          measurementName={measurementName} 
          measurementSymbol={measurementSymbol} 
        />

        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <h2 className="text-lg font-semibold mb-4">
            ค่า {measurementName} จากทุกอุปกรณ์
          </h2>
          
          <DeviceCardList 
            isLoading={isLoading}
            devices={devices}
            measurementSymbol={measurementSymbol}
          />
        </div>
      </main>

      {/* Add space to prevent content from being hidden behind footer */}
      <div className="pb-32"></div>

      {/* Footer navigation */}
      <FooterNav />
    </div>
  );
}
