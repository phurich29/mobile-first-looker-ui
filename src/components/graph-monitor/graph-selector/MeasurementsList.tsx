
import React from "react";
import { MeasurementCard } from "./MeasurementCard";
import { Skeleton } from "@/components/ui/skeleton";
import { SelectedGraph } from "../types";

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
