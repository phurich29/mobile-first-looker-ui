
import React, { useMemo } from "react";
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
  BarChart,
  Bar,
  ReferenceLine
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { GraphStyle } from "../types";
import { CustomTooltip } from "./CustomTooltip";
import {
  getGraphStyles,
  getSkeletonClass,
  getErrorTextClass,
  getChartTextColor
} from "./styles";

interface GraphChartContentProps {
  loading: boolean;
  error: string | null;
  data: any[];
  graphSymbol: string;
  graphName: string;
  graphStyle: GraphStyle;
  barColor?: string; // เพิ่มสีของกราฟแท่งที่ผู้ใช้เลือก
  lineColor?: string; // เพิ่มสีของเส้นค่าเฉลี่ยที่ผู้ใช้เลือก
}

export const GraphChartContent: React.FC<GraphChartContentProps> = ({
  loading,
  error,
  data,
  graphSymbol,
  graphName,
  graphStyle,
  barColor,
  lineColor
}) => {
  const styles = getGraphStyles(graphStyle, graphSymbol);
  
  // คำนวณค่าเฉลี่ยของข้อมูล
  const average = useMemo(() => {
    if (!data || data.length === 0) return 0;
    const sum = data.reduce((acc, item) => acc + (parseFloat(item.value) || 0), 0);
    return sum / data.length;
  }, [data]);

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
          <AreaChart 
            data={data} 
            className="transition-all duration-500" 
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
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
              width={30}
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
            <Tooltip content={<CustomTooltip graphStyle={graphStyle} />} />
            <Area
              type={styles.strokeType as any}
              dataKey="value"
              stroke={styles.lineColor}
              fill={`url(#colorValue-${graphSymbol})`}
              strokeWidth={styles.lineWidth}
              activeDot={{ r: styles.dotSize, fill: styles.dotColor }}
              name={graphName}
              animationDuration={1000}
            />
          </AreaChart>
        ) : (
          <AreaChart 
            data={data} 
            className="transition-all duration-500"
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <defs>
              <linearGradient id={`colorValue-${graphSymbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={barColor || styles.lineColor} stopOpacity={0.8} />
                <stop offset="95%" stopColor={barColor || styles.lineColor} stopOpacity={0.1} />
              </linearGradient>
              <filter id="shadow" height="200%">
                <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="rgba(0,0,0,0.1)" />
              </filter>
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
              width={30}
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
            <Tooltip content={<CustomTooltip graphStyle={graphStyle} />} />
            <Area
              dataKey="value"
              stroke={barColor || styles.lineColor}
              strokeWidth={2}
              fill={`url(#colorValue-${graphSymbol})`}
              fillOpacity={0.9}
              type="monotone"
              name={graphName}
              animationDuration={1000}
              dot={false}
              style={{ filter: "url(#shadow)" }}
            />
            {/* เส้นค่าเฉลี่ย */}
            <ReferenceLine
              y={average}
              stroke={lineColor || "#ff5722"}
              strokeWidth={2}
              strokeDasharray="3 3"
              label={{
                value: `ค่าเฉลี่ย: ${average.toFixed(2)}`,
                fill: graphStyle === "monochrome" || graphStyle === "neon" || graphStyle === "gradient"
                  ? "rgba(255,255,255,0.9)"
                  : "#333",
                fontSize: 11,
                position: "insideTopRight"
              }}
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default GraphChartContent;
