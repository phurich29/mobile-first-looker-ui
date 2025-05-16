
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SelectedGraph } from "./types";
import { TimeFrame } from "@/components/measurement-history/MeasurementHistory";
import { GraphStyle } from "./types";
import { getGraphStyles, getChartTextColor } from "./graph-card/styles";
import { GraphHeader } from "./graph-card/GraphHeader";
import { GraphChartContent } from "./graph-card/GraphChartContent";
import { useGraphData } from "./graph-card/useGraphData";

interface GraphCardProps {
  graph: SelectedGraph;
  onRemove: () => void;
}

export const GraphCard: React.FC<GraphCardProps> = ({ graph, onRemove }) => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("24h");
  const [graphStyle, setGraphStyle] = useState<GraphStyle>("classic");
  const { loading, data, error } = useGraphData(graph, timeFrame);
  
  const styles = getGraphStyles(graphStyle, graph.symbol);
  const chartTextColorClass = getChartTextColor(graphStyle);

  return (
    <Card 
      className={`shadow-md overflow-hidden ${styles.cardBg} group transition-all duration-300 hover:shadow-lg border-l-4 border-l-emerald-500/70 dark:border-l-emerald-600/50`}
      data-graph-id={`graph-${graph.deviceCode}-${graph.symbol}`}
      style={{ transform: 'translateZ(0)' }} // Force GPU rendering for stability
    >
      <GraphHeader 
        graph={graph}
        onRemove={onRemove}
        timeFrame={timeFrame}
        setTimeFrame={setTimeFrame}
        graphStyle={graphStyle}
        setGraphStyle={setGraphStyle}
      />
      <CardContent className={`p-4 h-64 relative ${chartTextColorClass}`}>
        {/* Rice icon watermark - very subtle in background, optimized for stability */}
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.02] dark:opacity-[0.03] pointer-events-none">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 64 64" 
            className="w-32 h-32"
            fill="currentColor"
            style={{ transform: 'translateZ(0)' }} // Force GPU rendering for stability
          >
            {/* Simplified rice grain icon with fewer path points */}
            <path d="M32,10c-12.15,0-22,9.85-22,22s9.85,22,22,22s22-9.85,22-22S44.15,10,32,10z M32,50
              c-9.94,0-18-8.06-18-18s8.06-18,18-18s18,8.06,18,18S41.94,50,32,50z" />
            <path d="M41,22.5c-6.71,0-12.18,5.47-12.18,12.18c0,6.71,5.47,12.18,12.18,12.18s12.18-5.47,12.18-12.18
              C53.18,27.97,47.71,22.5,41,22.5z" />
          </svg>
        </div>
        
        <GraphChartContent
          loading={loading}
          error={error}
          data={data}
          graphSymbol={graph.symbol}
          graphName={graph.name}
          graphStyle={graphStyle}
        />
      </CardContent>
    </Card>
  );
};
