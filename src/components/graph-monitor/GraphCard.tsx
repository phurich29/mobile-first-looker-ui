
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SelectedGraph } from "./types";
import { TimeFrame } from "@/components/measurement-history/MeasurementHistory";
import { GraphStyle } from "./types";
import { getGraphStyles, getChartTextColor } from "./graph-card/graph-styles";
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
    <Card className={`shadow-md overflow-hidden ${styles.cardBg} group transition-all hover:shadow-lg`}>
      <GraphHeader 
        graph={graph}
        onRemove={onRemove}
        timeFrame={timeFrame}
        setTimeFrame={setTimeFrame}
        graphStyle={graphStyle}
        setGraphStyle={setGraphStyle}
      />
      <CardContent className={`p-4 h-64 relative ${chartTextColorClass}`}>
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
