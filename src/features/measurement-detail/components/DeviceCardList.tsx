
import React from "react";
import { DeviceCard } from "./DeviceCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import type { DeviceData } from "../hooks/useMeasurementDeviceData";

interface DeviceCardListProps {
  isLoading: boolean;
  devices: DeviceData[];
  measurementSymbol: string | undefined;
}

export const DeviceCardList: React.FC<DeviceCardListProps> = ({ 
  isLoading, 
  devices, 
  measurementSymbol 
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array(7).fill(0).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center">
              <Skeleton className="h-12 w-12 rounded-full mr-3" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {devices.map((device) => (
        <DeviceCard 
          key={device.deviceCode} 
          device={device} 
          measurementSymbol={measurementSymbol} 
        />
      ))}
    </div>
  );
};
