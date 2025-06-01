
import React from "react";
import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/layouts/app-layout"; // Import AppLayout
import { getMeasurementThaiName } from "@/utils/measurements";
// Header and FooterNav are handled by AppLayout

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
    <AppLayout showFooterNav={true} contentPaddingBottom="pb-32">
      {/* Main content container with original padding. Dynamic margins and specific footer padding are handled by AppLayout. */}
      <div className="flex-1 p-4"> {/* Removed pb-32 as it's handled by AppLayout prop */}
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
      </div>
    </AppLayout>
  );
}
