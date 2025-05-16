
import React from "react";
import { Badge } from "@/components/ui/badge";
import { SelectedMetric } from "./types";

interface MetricBadgesProps {
  selectedMetrics: SelectedMetric[];
  onRemoveMetric: (deviceCode: string, symbol: string) => void;
}

export const MetricBadges: React.FC<MetricBadgesProps> = ({
  selectedMetrics,
  onRemoveMetric
}) => {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-medium text-gray-800 dark:text-gray-200">
        ข้อมูลสรุป
      </h2>
      <div className="mt-2 flex flex-wrap gap-2">
        {selectedMetrics.map((metric) => (
          <Badge 
            key={`${metric.deviceCode}_${metric.symbol}`}
            variant="outline" 
            className="flex items-center gap-2 cursor-pointer pr-1"
            style={{ borderColor: metric.color, color: metric.color }}
            onClick={() => onRemoveMetric(metric.deviceCode, metric.symbol)}
          >
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: metric.color }}
            ></div>
            {metric.name} ({metric.deviceName})
            <span className="ml-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-1 text-gray-500">✕</span>
          </Badge>
        ))}
      </div>
    </div>
  );
};
