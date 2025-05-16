
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectedGraph } from "./types";
import { GraphCard } from "./GraphCard";
import { useIsMobile } from "@/hooks/use-mobile";

interface GraphDisplayProps {
  selectedGraphs: SelectedGraph[];
  onRemoveGraph: (index: number) => void;
}

export const GraphDisplay: React.FC<GraphDisplayProps> = ({
  selectedGraphs,
  onRemoveGraph,
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="grid grid-cols-2 gap-4">
      {selectedGraphs.map((graph, index) => (
        <GraphCard 
          key={`${graph.deviceCode}-${graph.symbol}-${index}`}
          graph={graph} 
          onRemove={() => onRemoveGraph(index)} 
        />
      ))}
    </div>
  );
};
