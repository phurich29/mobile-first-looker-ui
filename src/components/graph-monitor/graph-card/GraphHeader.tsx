
import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Wheat } from "lucide-react";
import { GraphStyle } from "../types";
import { SelectedGraph } from "../types";
import { TimeFrame } from "@/components/measurement-history/MeasurementHistory";
import { getGraphStyles } from "./styles";
import { GraphStyleControls } from "./GraphStyleControls";

interface GraphHeaderProps {
  graph: SelectedGraph;
  onRemove: () => void;
  timeFrame: TimeFrame;
  setTimeFrame: (value: TimeFrame) => void;
  graphStyle: GraphStyle;
  setGraphStyle: (value: GraphStyle) => void;
}

export const GraphHeader: React.FC<GraphHeaderProps> = ({
  graph,
  onRemove,
  timeFrame,
  setTimeFrame,
  graphStyle,
  setGraphStyle
}) => {
  const styles = getGraphStyles(graphStyle, graph.symbol);

  return (
    <CardHeader className={`${styles.headerBg} py-3`}>
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 shadow-sm relative overflow-hidden ${styles.iconBg}`}
            >
              <div className="absolute inset-0 bg-white/10"></div>
              <div className="absolute top-0 left-0 w-2 h-2 bg-white/30 rounded-full blur-sm"></div>
              <Wheat className={`h-5 w-5 ${styles.iconText}`} />
            </div>
            <div>
              <CardTitle className={`text-lg font-medium ${styles.titleColor}`}>
                {graph.name}
              </CardTitle>
              <p className={`text-xs ${styles.subtitleColor}`}>
                อุปกรณ์: {graph.deviceName}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className={`h-8 w-8 p-0 opacity-70 group-hover:opacity-100 ${styles.buttonHoverBg} ${styles.buttonHoverText}`}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">ลบกราฟ</span>
          </Button>
        </div>
        
        <GraphStyleControls 
          timeFrame={timeFrame}
          setTimeFrame={setTimeFrame}
          graphStyle={graphStyle}
          setGraphStyle={setGraphStyle}
        />
      </div>
    </CardHeader>
  );
};

export default GraphHeader;
