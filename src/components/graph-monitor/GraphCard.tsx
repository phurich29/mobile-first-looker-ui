
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Wheat } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SelectedGraph } from "./types";
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
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ChartContainer,
} from "@/components/ui/chart";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimeFrame } from "@/components/measurement-history/MeasurementHistory";
import { getTimeFrameHours } from "@/components/measurement-history/api";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface GraphCardProps {
  graph: SelectedGraph;
  onRemove: () => void;
}

// Define graph style options
export type GraphStyle = 
  | "classic" 
  | "neon" 
  | "pastel" 
  | "monochrome" 
  | "gradient";

export const GraphCard: React.FC<GraphCardProps> = ({ graph, onRemove }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("24h");
  const [graphStyle, setGraphStyle] = useState<GraphStyle>("classic");

  useEffect(() => {
    fetchGraphData();
  }, [graph, timeFrame]);

  const fetchGraphData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Calculate cutoff date based on timeframe
      const hours = getTimeFrameHours(timeFrame);
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - hours);
      
      const { data, error } = await supabase
        .from("rice_quality_analysis")
        .select("*")
        .eq("device_code", graph.deviceCode)
        .gt("created_at", cutoffDate.toISOString())
        .order("created_at", { ascending: false })
        .limit(30);

      if (error) {
        console.error("Error fetching graph data:", error);
        setError("ไม่สามารถโหลดข้อมูลได้");
        return;
      }

      if (!data || data.length === 0) {
        setError("ไม่พบข้อมูล");
        setData([]);
        return;
      }

      // Transform the data for the chart, accessing the specific column directly
      const chartData = data
        .filter(item => 
          item[graph.symbol] !== undefined
        )
        .map(item => {
          const value = item[graph.symbol];
          
          // Format date for display
          const date = new Date(item.created_at);
          const formattedDate = `${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
          
          return {
            time: formattedDate,
            value: Number(value),
            fullDate: item.created_at
          };
        })
        .reverse(); // Display oldest to newest

      setData(chartData);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("เกิดข้อผิดพลาดที่ไม่คาดคิด");
    } finally {
      setLoading(false);
    }
  };

  const getColor = () => {
    // Generate a color based on the graph name to keep it consistent
    const hash = graph.symbol.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    const colors = [
      "#9b87f5", // primary purple
      "#7E69AB", // secondary purple
      "#6E59A5", // tertiary purple
      "#D6BCFA", // light purple
      "#4C51BF", // indigo
      "#38B2AC", // teal
      "#ED64A6", // pink
      "#ED8936", // orange
      "#48BB78"  // green
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Get icon color based on measurement type
  const getIconColor = () => {
    // For class measurement types
    if (graph.symbol === "class1") return "#9b87f5"; // primary purple 
    if (graph.symbol === "class2") return "#7E69AB"; // secondary purple
    if (graph.symbol === "class3") return "#6E59A5"; // tertiary purple
    if (graph.symbol === "short_grain") return "#333333"; // dark gray
    if (graph.symbol === "slender_kernel") return "#D6BCFA"; // light purple
    
    // Colors for ingredients
    if (graph.symbol === "whole_kernels") return "#4CAF50"; // green
    if (graph.symbol === "head_rice") return "#9b87f5"; // primary purple
    if (graph.symbol === "total_brokens") return "#7E69AB"; // secondary purple
    if (graph.symbol === "small_brokens") return "#6E59A5"; // tertiary purple
    if (graph.symbol === "small_brokens_c1") return "#D6BCFA"; // light purple
    
    // Colors for impurities
    if (graph.symbol.includes("red")) return "#9b87f5"; // primary purple
    if (graph.symbol.includes("white")) return "#EEEEEE"; // light gray
    if (graph.symbol.includes("yellow")) return "#D6BCFA"; // light purple
    if (graph.symbol.includes("black")) return "#212121"; // almost black
    
    // Default to a generated color based on the symbol
    return getColor();
  };

  // Get styling for each graph style
  const getGraphStyles = () => {
    switch (graphStyle) {
      case "classic":
        return {
          chartBackground: "transparent",
          lineColor: getIconColor(),
          gridColor: "#f0f0f0",
          dotColor: getIconColor(),
          dotSize: 6,
          lineWidth: 2,
          chartType: "line",
          strokeType: "monotone",
          tooltip: "bg-white border border-purple-100 shadow-md rounded-md",
        };
      case "neon":
        return {
          chartBackground: "rgb(8, 8, 32)",
          lineColor: "#00FFFF",
          gridColor: "rgba(0, 255, 255, 0.2)",
          dotColor: "#FFFFFF",
          dotSize: 8,
          lineWidth: 3,
          chartType: "line",
          strokeType: "monotone", 
          tooltip: "bg-gray-900 border border-cyan-500 text-white shadow-lg rounded-md",
        };
      case "pastel":
        return {
          chartBackground: "#F8F7FF",
          lineColor: "#FFA69E",
          gridColor: "#E9E8FF",
          dotColor: "#FF7E6B",
          dotSize: 5,
          lineWidth: 2,
          chartType: "area",
          strokeType: "basis",
          tooltip: "bg-white border border-pink-100 shadow-sm rounded-lg",
        };
      case "monochrome":
        return {
          chartBackground: "#111827",
          lineColor: "#FFFFFF",
          gridColor: "rgba(255, 255, 255, 0.1)",
          dotColor: "#FFFFFF",
          dotSize: 4,
          lineWidth: 1,
          chartType: "line",
          strokeType: "stepAfter",
          tooltip: "bg-gray-800 border border-gray-600 text-white shadow-sm rounded-md",
        };
      case "gradient":
        return {
          chartBackground: "linear-gradient(180deg, #2E1065 0%, #1E1B4B 100%)",
          lineColor: "#10B981",
          gradientFrom: "#10B981",
          gradientTo: "rgba(16, 185, 129, 0.1)",
          gridColor: "rgba(255, 255, 255, 0.1)",
          dotColor: "#34D399",
          dotSize: 6,
          lineWidth: 2,
          chartType: "area",
          strokeType: "monotone",
          tooltip: "bg-emerald-900 border border-emerald-700 text-white backdrop-blur-sm shadow-md rounded-md",
        };
      default:
        return {
          chartBackground: "transparent",
          lineColor: getIconColor(),
          gridColor: "#f0f0f0",
          dotColor: getIconColor(),
          dotSize: 6,
          lineWidth: 2,
          chartType: "line", 
          strokeType: "monotone",
          tooltip: "bg-white border border-purple-100 shadow-md rounded-md",
        };
    }
  };

  const styles = getGraphStyles();

  // Get style names for display
  const getStyleName = (style: GraphStyle): string => {
    switch (style) {
      case "classic": return "คลาสสิก";
      case "neon": return "นีออน";
      case "pastel": return "พาสเทล";
      case "monochrome": return "โมโนโครม";
      case "gradient": return "ไล่สี";
      default: return "คลาสสิก";
    }
  };

  return (
    <Card className="shadow-md overflow-hidden border-purple-100 group transition-all hover:shadow-lg">
      <CardHeader className="bg-gray-50 border-b border-purple-100 py-3">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center mr-3 shadow-sm relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${getIconColor()}, ${getIconColor()}cc)` }}
              >
                <div className="absolute inset-0 bg-white/10"></div>
                <div className="absolute top-0 left-0 w-2 h-2 bg-white/30 rounded-full blur-sm"></div>
                <Wheat className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-medium text-gray-800">
                  {graph.name}
                </CardTitle>
                <p className="text-xs text-gray-500">
                  อุปกรณ์: {graph.deviceName}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-8 w-8 p-0 opacity-70 group-hover:opacity-100 hover:bg-purple-100 hover:text-purple-700"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">ลบกราฟ</span>
            </Button>
          </div>
          
          <div className="flex justify-end">
            <Select value={timeFrame} onValueChange={(value) => setTimeFrame(value as TimeFrame)}>
              <SelectTrigger className="h-7 w-36 text-xs border-gray-200 bg-white">
                <SelectValue placeholder="กรอบเวลา" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 ชั่วโมง</SelectItem>
                <SelectItem value="24h">24 ชั่วโมง</SelectItem>
                <SelectItem value="7d">7 วัน</SelectItem>
                <SelectItem value="30d">30 วัน</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 h-64 relative">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <Skeleton className="h-full w-full bg-purple-50" />
          </div>
        ) : error ? (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-500 text-sm">{error}</p>
          </div>
        ) : data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-500 text-sm">ไม่พบข้อมูล</p>
          </div>
        ) : (
          <>
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
                      <linearGradient id={`colorValue-${graph.symbol}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={styles.gradientFrom || styles.lineColor} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={styles.gradientTo || styles.lineColor} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={styles.gridColor} />
                    <XAxis 
                      dataKey="time"
                      tick={{ fontSize: 10, fill: graphStyle === "monochrome" || graphStyle === "neon" || graphStyle === "gradient" ? "rgba(255,255,255,0.7)" : "#666" }}
                      tickFormatter={(value) => value.split(' ')[0]}
                      stroke={graphStyle === "monochrome" || graphStyle === "neon" || graphStyle === "gradient" ? "rgba(255,255,255,0.5)" : "#666"}
                    />
                    <YAxis 
                      tick={{ 
                        fontSize: 10, 
                        fill: graphStyle === "monochrome" || graphStyle === "neon" || graphStyle === "gradient" ? "rgba(255,255,255,0.7)" : "#666" 
                      }} 
                      stroke={graphStyle === "monochrome" || graphStyle === "neon" || graphStyle === "gradient" ? "rgba(255,255,255,0.5)" : "#666"}
                    />
                    <Tooltip content={<CustomTooltip className={styles.tooltip} />} />
                    <Area
                      type={styles.strokeType as any}
                      dataKey="value"
                      stroke={styles.lineColor}
                      fill={`url(#colorValue-${graph.symbol})`}
                      strokeWidth={styles.lineWidth}
                      activeDot={{ r: styles.dotSize, fill: styles.dotColor }}
                      name={graph.name}
                    />
                  </AreaChart>
                ) : (
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke={styles.gridColor} />
                    <XAxis 
                      dataKey="time"
                      tick={{ 
                        fontSize: 10,
                        fill: graphStyle === "monochrome" || graphStyle === "neon" ? "rgba(255,255,255,0.7)" : "#666"
                      }}
                      tickFormatter={(value) => value.split(' ')[0]}
                      stroke={graphStyle === "monochrome" || graphStyle === "neon" ? "rgba(255,255,255,0.5)" : "#666"}
                    />
                    <YAxis 
                      tick={{ 
                        fontSize: 10,
                        fill: graphStyle === "monochrome" || graphStyle === "neon" ? "rgba(255,255,255,0.7)" : "#666"
                      }} 
                      stroke={graphStyle === "monochrome" || graphStyle === "neon" ? "rgba(255,255,255,0.5)" : "#666"}
                    />
                    <Tooltip content={<CustomTooltip className={styles.tooltip} />} />
                    <Line
                      type={styles.strokeType as any}
                      dataKey="value"
                      stroke={styles.lineColor}
                      strokeWidth={styles.lineWidth}
                      activeDot={{ r: styles.dotSize, fill: styles.dotColor }}
                      name={graph.name}
                      dot={false}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </ChartContainer>

            {/* Style selector at the bottom left */}
            <div className="absolute bottom-2 left-2 z-10 flex flex-row gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 px-2 text-xs border-gray-200 bg-white/90 hover:bg-white"
                  >
                    สไตล์: {getStyleName(graphStyle)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-32">
                  <DropdownMenuItem 
                    className={`text-sm ${graphStyle === 'classic' ? 'bg-purple-50' : ''}`} 
                    onClick={() => setGraphStyle('classic')}
                  >
                    คลาสสิก
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={`text-sm ${graphStyle === 'neon' ? 'bg-purple-50' : ''}`} 
                    onClick={() => setGraphStyle('neon')}
                  >
                    นีออน
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={`text-sm ${graphStyle === 'pastel' ? 'bg-purple-50' : ''}`} 
                    onClick={() => setGraphStyle('pastel')}
                  >
                    พาสเทล
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={`text-sm ${graphStyle === 'monochrome' ? 'bg-purple-50' : ''}`} 
                    onClick={() => setGraphStyle('monochrome')}
                  >
                    โมโนโครม
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={`text-sm ${graphStyle === 'gradient' ? 'bg-purple-50' : ''}`} 
                    onClick={() => setGraphStyle('gradient')}
                  >
                    ไล่สี
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const CustomTooltip = ({ active, payload, label, className }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={className || "bg-white p-2 border border-purple-100 shadow-md rounded-md"}>
        <p className="text-xs font-medium">{label}</p>
        <p className="text-xs text-gray-600">{`${payload[0].name}: ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};
