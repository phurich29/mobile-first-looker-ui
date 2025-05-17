
import React from "react";
import { SelectedMetric } from "./types";
import { getMeasurementThaiName } from "@/utils/measurementFormatters";

interface GraphTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  selectedMetrics: SelectedMetric[];
}

export const GraphTooltip: React.FC<GraphTooltipProps> = ({ 
  active, 
  payload, 
  label,
  selectedMetrics
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
        <p className="text-sm font-medium mb-2">{`เวลา: ${label}`}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => {
            // Find original metric for this entry
            const metricKey = entry.dataKey as string;
            const [deviceCode, symbol] = metricKey.split('_');
            const metric = selectedMetrics.find(
              m => m.deviceCode === deviceCode && m.symbol === symbol
            );
            
            if (!metric) return null;
            
            // Get Thai name if available, otherwise use the original name
            const thaiName = getMeasurementThaiName(metric.symbol) || metric.name;
            
            return (
              <div 
                key={index} 
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: metric.color }}
                  ></div>
                  <span className="text-xs font-medium">
                    {thaiName} ({metric.deviceName})
                  </span>
                </div>
                <span className="text-xs font-mono ml-4">
                  {Number(entry.value).toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};
