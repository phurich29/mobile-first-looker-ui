
import React from "react";
import { SelectedMetric } from "./types";

interface GraphLegendProps {
  payload: any[];
  selectedMetrics: SelectedMetric[];
}

export const GraphLegend: React.FC<GraphLegendProps> = ({ 
  payload, 
  selectedMetrics 
}) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center pt-4">
      {payload.map((entry: any, index: number) => {
        // Find the corresponding metric data
        const metricKey = entry.dataKey;
        const [deviceCode, symbol] = metricKey.split('_');
        const metric = selectedMetrics.find(
          m => m.deviceCode === deviceCode && m.symbol === symbol
        );
        
        if (!metric) return null;
        
        return (
          <div 
            key={`item-${index}`}
            className="flex items-center mx-2"
          >
            <div 
              className="w-3 h-3 mr-1" 
              style={{ backgroundColor: metric.color }}
            />
            <span className="text-sm">
              {metric.name} 
              <span className="text-xs text-gray-500 ml-1">
                ({metric.deviceName} • รหัส: {metric.deviceCode})
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
};
