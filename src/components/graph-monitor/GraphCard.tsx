
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
  // กำหนดสีกราฟแท่งเริ่มต้นเป็นสีน้ำเงินหรือใช้สีที่ผู้ใช้กำหนดไว้แล้ว
  const [barColor, setBarColor] = useState<string>(graph.barColor || "#4863AD");
  // กำหนดสีเส้นค่าเฉลี่ยเริ่มต้นเป็นสีส้มหรือใช้สีที่ผู้ใช้กำหนดไว้แล้ว
  const [lineColor, setLineColor] = useState<string>(graph.lineColor || "#ff5722");
  const { loading, data, error } = useGraphData(graph, timeFrame);
  
  const styles = getGraphStyles(graphStyle, graph.symbol);
  const chartTextColorClass = getChartTextColor(graphStyle);

  return (
    <Card 
      className={`overflow-hidden ${styles.cardBg} group transition-all duration-300 rounded-xl border border-gray-200 dark:border-gray-700`}
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
        barColor={barColor}
        setBarColor={setBarColor}
        lineColor={lineColor}
        setLineColor={setLineColor}
      />
      <CardContent className={`pt-4 pr-4 pb-4 pl-0 h-64 relative ${chartTextColorClass}`}>
        {/* Ultra subtle watermark - barely visible */}
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.005] dark:opacity-[0.01] pointer-events-none">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 120 120"
            className="w-20 h-20" // Even smaller size
            style={{ transform: 'translateZ(0)' }}
          >
            {/* Simplified rice grain ellipse */}
            <ellipse 
              cx="60" cy="20" rx="10" ry="15"
              transform="rotate(-15 60 20)"
              fill="currentColor" 
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.3"
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
          barColor={barColor}
          lineColor={lineColor}
        />
      </CardContent>
    </Card>
  );
};
