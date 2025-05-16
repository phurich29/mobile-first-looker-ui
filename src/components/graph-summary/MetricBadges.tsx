
import React from "react";
import { Badge } from "@/components/ui/badge";
import { SelectedMetric } from "./types";
import { ColorLinePicker } from "./ColorLinePicker";

interface MetricBadgesProps {
  selectedMetrics: SelectedMetric[];
  onRemoveMetric: (deviceCode: string, symbol: string) => void;
  onUpdateMetricColor?: (deviceCode: string, symbol: string, color: string) => void;
}

export const MetricBadges: React.FC<MetricBadgesProps> = ({
  selectedMetrics,
  onRemoveMetric,
  onUpdateMetricColor = () => {}
}) => {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium text-gray-800 dark:text-gray-200">
          ข้อมูลสรุป
        </h2>
        <div className="text-xs text-gray-500 flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse mr-1" />
          <span>คลิกที่จุดสีเพื่อเปลี่ยนสีเส้นกราฟ</span>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {selectedMetrics.map((metric) => (
          <Badge 
            key={`${metric.deviceCode}_${metric.symbol}`}
            variant="outline" 
            className="flex items-center gap-2 pr-1"
            style={{ borderColor: metric.color, color: metric.color }}
          >
            <div className="relative group">
              <ColorLinePicker
                color={metric.color}
                onChange={(color) => onUpdateMetricColor(metric.deviceCode, metric.symbol, color)}
                metricName={metric.name}
                deviceName={metric.deviceName}
              />
              <div className="absolute -top-8 left-0 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                คลิกเพื่อเปลี่ยนสี
              </div>
            </div>
            <span className="cursor-text">{metric.name} ({metric.deviceName})</span>
            <span 
              className="ml-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-1 text-gray-500 cursor-pointer"
              onClick={() => onRemoveMetric(metric.deviceCode, metric.symbol)}
            >
              ✕
            </span>
          </Badge>
        ))}
      </div>
    </div>
  );
};
