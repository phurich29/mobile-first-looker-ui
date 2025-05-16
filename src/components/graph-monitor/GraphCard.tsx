
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
      className={`shadow-md overflow-hidden ${styles.cardBg} group transition-all duration-300 hover:shadow-lg border-l-4 border-l-emerald-500/70 dark:border-l-emerald-600/50 rounded-xl`}
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
        {/* Rice grain logo watermark - very subtle in background */}
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.02] dark:opacity-[0.03] pointer-events-none">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 100 120"
            className="w-36 h-36 animate-pulse"
            style={{ 
              transform: 'translateZ(0)', // Force GPU rendering for stability
              animationDuration: '4s'
            }}
          >
            {/* Rice grains like the logo */}
            <path 
              d="M43,20 C43,15 45,10 50,10 C55,10 57,15 57,20 C57,25 55,30 50,30 C45,30 43,25 43,20 Z" 
              fill="currentColor" 
              stroke="currentColor"
              strokeWidth="2"
              opacity="0.8"
            />
            
            <path 
              d="M38,35 C38,31 40,27 44,27 C48,27 50,31 50,35 C50,39 48,43 44,43 C40,43 38,39 38,35 Z" 
              fill="currentColor" 
              stroke="currentColor"
              strokeWidth="2"
              opacity="0.8"
            />
            
            <path 
              d="M50,35 C50,31 52,27 56,27 C60,27 62,31 62,35 C62,39 60,43 56,43 C52,43 50,39 50,35 Z" 
              fill="currentColor" 
              stroke="currentColor"
              strokeWidth="2"
              opacity="0.8"
            />
            
            <path 
              d="M43,50 C43,45 45,40 50,40 C55,40 57,45 57,50 C57,55 55,60 50,60 C45,60 43,55 43,50 Z" 
              fill="currentColor" 
              stroke="currentColor"
              strokeWidth="2"
              opacity="0.8"
            />
            
            {/* Add cute eyes and smile to the grain for extra cuteness */}
            <circle cx="47" cy="17" r="1.5" fill="currentColor" />
            <circle cx="53" cy="17" r="1.5" fill="currentColor" />
            <path 
              d="M48,22 Q50,24 52,22" 
              fill="none" 
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
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
