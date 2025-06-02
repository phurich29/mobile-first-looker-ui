
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
    case 'classic':
      return "flex flex-col bg-white dark:bg-gray-800 border border-purple-100 dark:border-gray-700 p-4 h-[600px]";
    case 'natural':
      return "flex flex-col bg-[#F5F5F2] dark:bg-[#1F2A1D] border border-[#E8E6DD] dark:border-[#2A3626] p-4 h-[600px]";
    case 'neon':
      return "flex flex-col bg-gray-900 border border-cyan-600 p-4 h-[600px] text-cyan-300";
    case 'pastel':
      return "flex flex-col bg-blue-50/80 border border-blue-200/80 p-4 h-[600px] dark:bg-indigo-950/30 dark:border-indigo-800/40";
    case 'monochrome':
      return "flex flex-col bg-gray-900 border border-gray-700 p-4 h-[600px] text-gray-200";
    case 'gradient':
      return "flex flex-col bg-gradient-to-br from-violet-900 to-indigo-900 border border-indigo-700 p-4 h-[600px] text-white";
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
      ) : graphData.length === 0 ? (
        <NoDataState />
      ) : (
        <>
          <MetricBadges 
            selectedMetrics={selectedMetrics} 
            onRemoveMetric={onRemoveMetric}
            onUpdateMetricColor={onUpdateMetricColor}
            onSavePreferences={onSavePreferences}
            saving={saving}
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
