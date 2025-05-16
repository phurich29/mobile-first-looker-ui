
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
        {/* Rice plant watermark - very subtle in background */}
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.02] dark:opacity-[0.03] pointer-events-none">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 100 120"
            className="w-36 h-36"
            fill="currentColor"
            style={{ transform: 'translateZ(0)' }} // Force GPU rendering for stability
          >
            {/* Rice plant stem */}
            <path d="M50,120 L50,60 C50,60 48,40 50,30 C52,20 55,10 50,0" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round"/>
            
            {/* Rice plant leaves */}
            <path d="M50,80 C60,70 70,75 80,65" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round"/>
            
            <path d="M50,70 C60,65 75,70 85,60" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round"/>
            
            <path d="M50,60 C40,50 30,55 20,45" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round"/>
            
            <path d="M50,50 C40,45 25,50 15,40" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round"/>
            
            {/* Rice grains at the top */}
            <path d="M43,20 C43,15 45,10 50,10 C55,10 57,15 57,20 C57,25 55,30 50,30 C45,30 43,25 43,20 Z" 
              fill="currentColor" 
              opacity="0.8"/>
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
