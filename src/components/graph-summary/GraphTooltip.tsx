
import React from "react";
import { SelectedMetric } from "./types";

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
  selectedMetrics,
}) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  // Format the timestamp for display
  const formattedTime = label || "";

  return (
    <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
      <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
        {formattedTime}
      </p>
      <div className="space-y-1">
        {payload.map((entry: any, index: number) => {
          // Get the device code and symbol from the dataKey
          const [deviceCode, symbol] = entry.dataKey.split('_');
          
          // Find the corresponding metric
          const metric = selectedMetrics.find(
            m => m.deviceCode === deviceCode && m.symbol === symbol
          );
          
          if (!metric) return null;
          
          return (
            <div key={index} className="flex items-center">
              <div
                className="w-3 h-3 mr-2"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-gray-700 dark:text-gray-300">
                {metric.name}:
                <span className="font-medium ml-1">{entry.value}</span>
                <span className="text-xs text-gray-500 ml-1">
                  ({metric.deviceName} • รหัส: {metric.deviceCode})
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
