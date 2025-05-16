
import React from "react";
import { SelectedGraph } from "./types";
import { GraphCard } from "./GraphCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    <ScrollArea className="h-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pr-4 pb-4">
        {selectedGraphs.map((graph, index) => (
          <GraphCard 
            key={`${graph.deviceCode}-${graph.symbol}-${index}`}
            graph={graph} 
            onRemove={() => onRemoveGraph(index)} 
          />
        ))}
      </div>
    </ScrollArea>
  );
};
