
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Cpu, Save } from "lucide-react";
import { SelectedMetric } from "./types";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { HexColorPicker } from "react-colorful";
import { getMeasurementThaiName } from "@/utils/measurements";

interface MetricBadgesProps {
  selectedMetrics: SelectedMetric[];
  onRemoveMetric: (deviceCode: string, symbol: string) => void;
  onUpdateMetricColor?: (deviceCode: string, symbol: string, color: string) => void;
  onSavePreferences?: () => void;
  saving?: boolean;
}

export const MetricBadges: React.FC<MetricBadgesProps> = ({
  selectedMetrics,
  onRemoveMetric,
  onUpdateMetricColor,
  onSavePreferences,
  saving = false
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {selectedMetrics.map((metric) => {
        // Get Thai name if available, otherwise use the original name
        const thaiName = getMeasurementThaiName(metric.symbol) || metric.name;
        
        return (
          <div key={`${metric.deviceCode}-${metric.symbol}`} className="flex items-center">
            <Badge
              className="py-1.5 px-3 flex items-center gap-1.5 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700"
            >
              <Popover>
                <PopoverTrigger asChild>
                  <div
                    className="w-3 h-3 rounded-full cursor-pointer"
                    style={{ backgroundColor: metric.color }}
                  />
                </PopoverTrigger>
                {onUpdateMetricColor && (
                  <PopoverContent className="w-auto p-3">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">เลือกสี</p>
                      <HexColorPicker
                        color={metric.color}
                        onChange={(color) => onUpdateMetricColor(metric.deviceCode, metric.symbol, color)}
                      />
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-xs font-mono">{metric.color}</div>
                      </div>
                    </div>
                  </PopoverContent>
                )}
              </Popover>
              <span className="mr-1">
                <Cpu size={12} className="text-gray-500" />
              </span>
              <span>
                {thaiName} ({metric.deviceName})
              </span>
              <button
                onClick={() => onRemoveMetric(metric.deviceCode, metric.symbol)}
                className="ml-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X size={14} />
              </button>
            </Badge>
          </div>
        );
      })}
      
      {selectedMetrics.length > 0 && onSavePreferences && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onSavePreferences}
          className="ml-2 h-7 px-2 text-xs bg-green-50 text-green-700 border-green-300 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
          disabled={saving}
        >
          <Save size={14} className="mr-1" />
          {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
        </Button>
      )}
    </div>
  );
};
