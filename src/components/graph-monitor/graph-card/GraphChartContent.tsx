
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { GraphStyle } from "../types";
import { CustomTooltip } from "./CustomTooltip";
import {
  getGraphStyles,
  getSkeletonClass,
  getErrorTextClass,
  getChartTextColor
} from "./graph-styles";

interface GraphChartContentProps {
  loading: boolean;
  error: string | null;
  data: any[];
  graphSymbol: string;
  graphName: string;
  graphStyle: GraphStyle;
}

export const GraphChartContent: React.FC<GraphChartContentProps> = ({
  loading,
  error,
  data,
  graphSymbol,
  graphName,
  graphStyle
}) => {
  const styles = getGraphStyles(graphStyle, graphSymbol);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Skeleton className={`h-full w-full ${getSkeletonClass(graphStyle)}`} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${getErrorTextClass(graphStyle)}`}>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${getErrorTextClass(graphStyle)}`}>
        <p className="text-sm">ไม่พบข้อมูล</p>
      </div>
    );
  }

  return (
    <ChartContainer
      className="h-full w-full"
      config={{}}
      style={{
        background: typeof styles.chartBackground === 'string'
          ? styles.chartBackground
          : undefined
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        {styles.chartType === 'area' ? (
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`colorValue-${graphSymbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={styles.gradientFrom || styles.lineColor} stopOpacity={0.8} />
                <stop offset="95%" stopColor={styles.gradientTo || styles.lineColor} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={styles.gridColor} />
            <XAxis
              dataKey="time"
              tick={{
                fontSize: 10,
                fill: graphStyle === "monochrome" || graphStyle === "neon" || graphStyle === "gradient"
                  ? "rgba(255,255,255,0.7)"
                  : "#666"
              }}
              tickFormatter={(value) => value.split(' ')[0]}
              stroke={graphStyle === "monochrome" || graphStyle === "neon" || graphStyle === "gradient"
                ? "rgba(255,255,255,0.5)"
                : "#666"}
            />
            <YAxis
              tick={{
                fontSize: 10,
                fill: graphStyle === "monochrome" || graphStyle === "neon" || graphStyle === "gradient"
                  ? "rgba(255,255,255,0.7)"
                  : "#666"
              }}
              stroke={graphStyle === "monochrome" || graphStyle === "neon" || graphStyle === "gradient"
                ? "rgba(255,255,255,0.5)"
                : "#666"}
            />
            <Tooltip content={<CustomTooltip className={styles.tooltip} />} />
            <Area
              type={styles.strokeType as any}
              dataKey="value"
              stroke={styles.lineColor}
              fill={`url(#colorValue-${graphSymbol})`}
              strokeWidth={styles.lineWidth}
              activeDot={{ r: styles.dotSize, fill: styles.dotColor }}
              name={graphName}
            />
          </AreaChart>
        ) : (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={styles.gridColor} />
            <XAxis
              dataKey="time"
              tick={{
                fontSize: 10,
                fill: graphStyle === "monochrome" || graphStyle === "neon" || graphStyle === "gradient"
                  ? "rgba(255,255,255,0.7)"
                  : "#666"
              }}
              tickFormatter={(value) => value.split(' ')[0]}
              stroke={graphStyle === "monochrome" || graphStyle === "neon" || graphStyle === "gradient"
                ? "rgba(255,255,255,0.5)"
                : "#666"}
            />
            <YAxis
              tick={{
                fontSize: 10,
                fill: graphStyle === "monochrome" || graphStyle === "neon" || graphStyle === "gradient"
                  ? "rgba(255,255,255,0.7)"
                  : "#666"
              }}
              stroke={graphStyle === "monochrome" || graphStyle === "neon" || graphStyle === "gradient"
                ? "rgba(255,255,255,0.5)"
                : "#666"}
            />
            <Tooltip content={<CustomTooltip className={styles.tooltip} />} />
            <Line
              type={styles.strokeType as any}
              dataKey="value"
              stroke={styles.lineColor}
              strokeWidth={styles.lineWidth}
              activeDot={{ r: styles.dotSize, fill: styles.dotColor }}
              name={graphName}
              dot={false}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default GraphChartContent;
