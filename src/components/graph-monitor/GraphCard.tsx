
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { SelectedGraph } from "./types";
import { useGraphData } from "./hooks/useGraphData";
import { GraphChartView } from "./GraphChartView";

interface GraphCardProps {
  graph: SelectedGraph;
  onRemove: () => void;
}

export const GraphCard: React.FC<GraphCardProps> = ({ graph, onRemove }) => {
  const { loading, data, error } = useGraphData(graph);

  return (
    <Card className="shadow-md overflow-hidden border border-border bg-card text-card-foreground">
      <CardHeader className="bg-muted dark:bg-muted py-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-medium text-foreground">
              {graph.name}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              อุปกรณ์: {graph.deviceName}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">ลบกราฟ</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 h-64">
        <GraphChartView
          loading={loading}
          data={data}
          error={error}
          graph={graph}
        />
      </CardContent>
    </Card>
  );
};
