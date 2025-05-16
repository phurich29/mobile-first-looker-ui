import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartDataPoint } from "./hooks/useGraphData";
import { SelectedGraph } from "./types";

interface GraphChartViewProps {
  loading: boolean;
  data: ChartDataPoint[];
  error: string | null;
  graph: SelectedGraph;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<any>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md">
        <p className="text-xs font-medium">{label}</p>
        <p className="text-xs text-gray-600">{`${payload[0].name}: ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

export const GraphChartView: React.FC<GraphChartViewProps> = ({
  loading,
  data,
  error,
  graph,
}) => {
  const getColor = () => {
    // Generate a color based on the graph name to keep it consistent
    const hash = graph.symbol.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    const colors = [
      "#9b87f5", // primary purple
      "#33C3F0", // sky blue
      "#0FA0CE", // bright blue
      "#D6BCFA", // light purple
      "#7E69AB", // secondary purple
      "#4C51BF", // indigo
      "#38B2AC", // teal
      "#ED64A6", // pink
      "#ED8936", // orange
      "#48BB78"  // green
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-gray-500 text-sm">{error}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-gray-500 text-sm">ไม่พบข้อมูล</p>
      </div>
    );
  }

  return (
    <ChartContainer className="h-full w-full" config={{}}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="time"
            tick={{ fontSize: 10 }}
            tickFormatter={(value) => value.split(' ')[0]}
          />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={getColor()}
            activeDot={{ r: 6 }}
            strokeWidth={2}
            name={graph.name}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
