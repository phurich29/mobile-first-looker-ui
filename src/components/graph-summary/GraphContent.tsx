
import React from "react";
import { SelectedMetric, GraphStyle } from "./types";
import { TimeFrame } from "@/components/measurement-history/MeasurementHistory";
import { MetricBadges } from "./MetricBadges";
import { GraphStyleControls } from "./GraphStyleControls";
import { MainChart } from "./MainChart";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";

interface GraphContentProps {
  loading: boolean;
  selectedMetrics: SelectedMetric[];
  graphData: any[];
  graphStyle: GraphStyle;
  globalLineColor: string;
  timeFrame: TimeFrame;
  onOpenSelector: () => void;
  onRemoveMetric: (deviceCode: string, symbol: string) => void;
  onUpdateMetricColor: (deviceCode: string, symbol: string, color: string) => void;
  onTimeFrameChange: (value: TimeFrame) => void;
  onGraphStyleChange: (value: GraphStyle) => void;
  onGlobalLineColorChange: (color: string) => void;
  onSavePreferences: () => void;
  saving: boolean;
}

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
  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-4">
      {/* Metric badges with add graph button */}
      <MetricBadges
        selectedMetrics={selectedMetrics}
        onRemoveMetric={onRemoveMetric}
        onUpdateMetricColor={onUpdateMetricColor}
        onAddGraph={onOpenSelector}
      />

      {selectedMetrics.length === 0 ? (
        <EmptyState onOpenSelector={onOpenSelector} />
      ) : (
        <>
          {/* Graph style controls */}
          <GraphStyleControls
            graphStyle={graphStyle}
            globalLineColor={globalLineColor}
            onGraphStyleChange={onGraphStyleChange}
            onGlobalLineColorChange={onGlobalLineColorChange}
          />

          {/* Main chart */}
          <MainChart
            graphData={graphData}
            selectedMetrics={selectedMetrics}
            graphStyle={graphStyle}
            globalLineColor={globalLineColor}
            timeFrame={timeFrame}
          />
        </>
      )}
    </div>
  );
};
