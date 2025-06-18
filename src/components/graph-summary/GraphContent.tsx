
import React from "react";
import { Card } from "@/components/ui/card";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";
import { NoDataState } from "./NoDataState";
import { MetricBadges } from "./MetricBadges";
import { MainChart } from "./MainChart";
import { SelectedMetric, GraphStyle } from "./types";
import GraphStyleControls from "./GraphStyleControls";
import { TimeFrame } from "@/components/measurement-history/MeasurementHistory";

interface GraphContentProps {
  loading: boolean;
  selectedMetrics: SelectedMetric[];
  graphData: any[];
  graphStyle: GraphStyle; 
  globalLineColor: string;
  timeFrame: TimeFrame;
  onOpenSelector: () => void;
  onRemoveMetric: (deviceCode: string, symbol: string) => void;
  onUpdateMetricColor?: (deviceCode: string, symbol: string, color: string) => void;
  onTimeFrameChange: (value: TimeFrame) => void;
  onGraphStyleChange: (value: GraphStyle) => void;
  onGlobalLineColorChange: (value: string) => void;
  onSavePreferences?: () => void;
  saving?: boolean;
}

// Function to get the appropriate card styling based on graph style
const getCardStyles = (graphStyle: GraphStyle): string => {
  switch (graphStyle) {
    case 'area':
      return "flex flex-col bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 p-4 h-[600px]";
    case 'line':
    default:
      return "flex flex-col bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 h-[600px]";
  }
};

export const GraphContent: React.FC<GraphContentProps> = ({
  loading,
  selectedMetrics,
  graphData,
  graphStyle,
  globalLineColor,
  timeFrame,
  onOpenSelector,
  onRemoveMetric,
  onUpdateMetricColor,
  onTimeFrameChange,
  onGraphStyleChange,
  onGlobalLineColorChange,
  onSavePreferences,
  saving
}) => {
  return (
    <Card className={getCardStyles(graphStyle)}>
      {loading ? (
        <LoadingState />
      ) : selectedMetrics.length === 0 ? (
        <EmptyState onOpenSelector={onOpenSelector} />
      ) : (
        // Always render graph components if not loading and metrics are selected,
        // MainChart will handle empty graphData
        <>
          <MetricBadges 
            selectedMetrics={selectedMetrics} 
            onRemoveMetric={onRemoveMetric}
            onUpdateMetricColor={onUpdateMetricColor}
            onSavePreferences={onSavePreferences}
            saving={saving}
            onOpenSelector={onOpenSelector} // Pass onOpenSelector to MetricBadges
          />
          
          <GraphStyleControls 
            timeFrame={timeFrame}
            setTimeFrame={onTimeFrameChange}
            graphStyle={graphStyle}
            setGraphStyle={onGraphStyleChange}
            globalLineColor={globalLineColor}
            setGlobalLineColor={onGlobalLineColorChange}
          />
          
          <div className="flex-1">
            <MainChart 
              graphData={graphData} 
              selectedMetrics={selectedMetrics}
              graphStyle={graphStyle}
              globalLineColor={globalLineColor}
            />
          </div>
        </>
      )}
    </Card>
  );
};
