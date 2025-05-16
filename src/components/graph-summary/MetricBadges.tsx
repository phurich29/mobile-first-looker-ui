
import React from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { SelectedMetric } from "./types";

interface MetricBadgesProps {
  selectedMetrics: SelectedMetric[];
  onRemoveMetric: (deviceCode: string, symbol: string) => void;
}

export const MetricBadges: React.FC<MetricBadgesProps> = ({
  selectedMetrics,
  onRemoveMetric,
}) => {
  if (selectedMetrics.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {selectedMetrics.map((metric) => (
        <Badge
          key={`${metric.deviceCode}_${metric.symbol}`}
          variant="outline"
          className="py-1 px-2 flex items-center gap-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-sm"
          style={{ borderLeft: `3px solid ${metric.color}` }}
        >
          <span className="mr-1">{metric.name}</span>
          <span className="text-xs text-gray-500">
            ({metric.deviceName} • รหัส: {metric.deviceCode})
          </span>
          <button
            onClick={() => onRemoveMetric(metric.deviceCode, metric.symbol)}
            className="ml-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-0.5"
          >
            <X className="h-3 w-3 text-gray-400" />
          </button>
        </Badge>
      ))}
    </div>
  );
};
