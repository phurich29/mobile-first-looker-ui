
import React from "react";
import { SelectedMetric } from "./types";
import { getMeasurementThaiName } from "@/utils/measurements";

interface GraphLegendProps {
  payload: any[];
  selectedMetrics: SelectedMetric[];
}

export const GraphLegend: React.FC<GraphLegendProps> = ({ 
  payload,
  selectedMetrics 
}) => {
  // Fixed color for all states - green only
  const greenColor = "#22c55e"; // Green

  return (
    <div className="flex flex-wrap justify-center mt-2 gap-4">
      {(payload || []).map((entry, index) => {
        // Extract the original metric info from the dataKey
        const metricKey = entry.dataKey as string;
        const [deviceCode, symbol] = metricKey.split('-');
        const metric = selectedMetrics.find(
          m => m.deviceCode === deviceCode && m.symbol === symbol
        );
        
        if (!metric) return null;
        
        // Get Thai name if available, otherwise use the original name
        const thaiName = getMeasurementThaiName(metric.symbol) || metric.name;
        
        return (
          <div key={index} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: greenColor }}
            ></div>
            <span className="text-xs">
              {thaiName} ({metric.deviceName})
            </span>
            {/* Show threshold range if available */}
            {(metric.minThreshold !== undefined || metric.maxThreshold !== undefined) && (
              <span className="text-xs text-gray-500 ml-1">
                {metric.minThreshold !== undefined && metric.minThreshold !== null ? `มิน: ${metric.minThreshold}` : ''}
                {metric.minThreshold !== undefined && metric.maxThreshold !== undefined ? ' - ' : ''}
                {metric.maxThreshold !== undefined && metric.maxThreshold !== null ? `แม็กซ์: ${metric.maxThreshold}` : ''}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
