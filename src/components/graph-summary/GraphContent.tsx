
import React from "react";
import { Card } from "@/components/ui/card";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";
import { NoDataState } from "./NoDataState";
import { MetricBadges } from "./MetricBadges";
import { MainChart } from "./MainChart";
import { SelectedMetric } from "./types";

interface GraphContentProps {
  loading: boolean;
  selectedMetrics: SelectedMetric[];
  graphData: any[];
  onOpenSelector: () => void;
  onRemoveMetric: (deviceCode: string, symbol: string) => void;
}

export const GraphContent: React.FC<GraphContentProps> = ({
  loading,
  selectedMetrics,
  graphData,
  onOpenSelector,
  onRemoveMetric
}) => {
  return (
    <Card className="flex flex-col bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 h-[600px]">
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
          />
          <div className="flex-1">
            <MainChart 
              graphData={graphData} 
              selectedMetrics={selectedMetrics} 
            />
          </div>
        </>
      )}
    </Card>
  );
};
