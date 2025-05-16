
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
          cardBg: "bg-white border-purple-100",
          headerBg: "bg-gray-50 border-b border-purple-100",
          titleColor: "text-gray-800",
          subtitleColor: "text-gray-500",
          buttonHoverBg: "hover:bg-purple-100",
          buttonHoverText: "hover:text-purple-700",
          iconBg: `bg-gradient-to-br from-${getIconColor()} to-${getIconColor()}cc`,
          iconText: "text-white",
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
          cardBg: "bg-gray-900 border-cyan-600",
          headerBg: "bg-gray-950 border-b border-cyan-700",
          titleColor: "text-cyan-300",
          subtitleColor: "text-cyan-500",
          buttonHoverBg: "hover:bg-cyan-900",
          buttonHoverText: "hover:text-cyan-300",
          iconBg: "bg-gradient-to-br from-cyan-500 to-blue-600",
          iconText: "text-white",
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
          cardBg: "bg-pink-50 border-pink-200",
          headerBg: "bg-pink-100 border-b border-pink-200",
          titleColor: "text-pink-700",
          subtitleColor: "text-pink-500",
          buttonHoverBg: "hover:bg-pink-200",
          buttonHoverText: "hover:text-pink-700",
          iconBg: "bg-gradient-to-br from-pink-400 to-purple-300",
          iconText: "text-white",
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
          cardBg: "bg-gray-900 border-gray-700",
          headerBg: "bg-gray-800 border-b border-gray-700",
          titleColor: "text-gray-100",
          subtitleColor: "text-gray-400",
          buttonHoverBg: "hover:bg-gray-700",
          buttonHoverText: "hover:text-white",
          iconBg: "bg-gradient-to-br from-gray-600 to-gray-500",
          iconText: "text-white",
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
          cardBg: "bg-gradient-to-br from-violet-900 to-indigo-900 border-indigo-700",
          headerBg: "bg-gradient-to-r from-violet-800 to-indigo-800 border-b border-indigo-700",
          titleColor: "text-white",
          subtitleColor: "text-indigo-200",
          buttonHoverBg: "hover:bg-white/10",
          buttonHoverText: "hover:text-white",
          iconBg: "bg-gradient-to-br from-emerald-400 to-green-500",
          iconText: "text-white",
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
          cardBg: "bg-white border-purple-100",
          headerBg: "bg-gray-50 border-b border-purple-100",
          titleColor: "text-gray-800",
          subtitleColor: "text-gray-500",
          buttonHoverBg: "hover:bg-purple-100",
          buttonHoverText: "hover:text-purple-700",
          iconBg: `bg-gradient-to-br from-${getIconColor()} to-${getIconColor()}cc`,
          iconText: "text-white",
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
    <Card className={`shadow-md overflow-hidden ${styles.cardBg} group transition-all hover:shadow-lg`}>
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
          
          <div className="flex items-center justify-end space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`h-7 px-2 text-xs ${graphStyle === 'classic' ? 'border-gray-200 bg-white/90 hover:bg-white' : 
                              graphStyle === 'neon' ? 'border-cyan-600 bg-gray-800 text-cyan-300 hover:bg-gray-700' : 
                              graphStyle === 'pastel' ? 'border-pink-200 bg-pink-100/80 text-pink-700 hover:bg-pink-100' :
                              graphStyle === 'monochrome' ? 'border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700' :
                              'border-indigo-600 bg-indigo-800/80 text-white hover:bg-indigo-700'}`}
                >
                  สไตล์: {getStyleName(graphStyle)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className={`min-w-32 ${
                graphStyle === 'neon' ? 'bg-gray-900 border-cyan-600 text-cyan-300' :
                graphStyle === 'pastel' ? 'bg-pink-50 border-pink-200' :
                graphStyle === 'monochrome' ? 'bg-gray-900 border-gray-700 text-gray-200' :
                graphStyle === 'gradient' ? 'bg-indigo-900 border-indigo-700 text-white' : ''
              }`}>
                <DropdownMenuItem 
                  className={`text-sm ${graphStyle === 'classic' ? 'bg-purple-50' : ''}`} 
                  onClick={() => setGraphStyle('classic')}
                >
                  คลาสสิก
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={`text-sm ${graphStyle === 'neon' ? 'bg-cyan-900' : ''}`} 
                  onClick={() => setGraphStyle('neon')}
                >
                  นีออน
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={`text-sm ${graphStyle === 'pastel' ? 'bg-pink-100' : ''}`} 
                  onClick={() => setGraphStyle('pastel')}
                >
                  พาสเทล
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={`text-sm ${graphStyle === 'monochrome' ? 'bg-gray-800' : ''}`} 
                  onClick={() => setGraphStyle('monochrome')}
                >
                  โมโนโครม
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={`text-sm ${graphStyle === 'gradient' ? 'bg-indigo-800' : ''}`} 
                  onClick={() => setGraphStyle('gradient')}
                >
                  ไล่สี
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Select 
              value={timeFrame} 
              onValueChange={(value) => setTimeFrame(value as TimeFrame)}
            >
              <SelectTrigger className={`h-7 w-36 text-xs ${
                graphStyle === 'classic' ? 'border-gray-200 bg-white' :
                graphStyle === 'neon' ? 'border-cyan-600 bg-gray-800 text-cyan-300' :
                graphStyle === 'pastel' ? 'border-pink-200 bg-pink-100/80 text-pink-700' :
                graphStyle === 'monochrome' ? 'border-gray-700 bg-gray-800 text-gray-200' :
                'border-indigo-600 bg-indigo-800/80 text-white'
              }`}>
                <SelectValue placeholder="กรอบเวลา" />
              </SelectTrigger>
              <SelectContent className={`${
                graphStyle === 'neon' ? 'bg-gray-900 border-cyan-600 text-cyan-300' :
                graphStyle === 'pastel' ? 'bg-pink-50 border-pink-200' :
                graphStyle === 'monochrome' ? 'bg-gray-900 border-gray-700 text-gray-200' :
                graphStyle === 'gradient' ? 'bg-indigo-900 border-indigo-700 text-white' : ''
              }`}>
                <SelectItem value="1h">1 ชั่วโมง</SelectItem>
                <SelectItem value="24h">24 ชั่วโมง</SelectItem>
                <SelectItem value="7d">7 วัน</SelectItem>
                <SelectItem value="30d">30 วัน</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className={`p-4 h-64 relative ${graphStyle !== 'classic' ? 'text-' + (
        graphStyle === 'neon' ? 'cyan-300' :
        graphStyle === 'pastel' ? 'pink-700' :
        graphStyle === 'monochrome' ? 'gray-200' :
        'white'
      ) : ''}`}>
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <Skeleton className={`h-full w-full ${
              graphStyle === 'classic' ? 'bg-purple-50' :
              graphStyle === 'neon' ? 'bg-gray-800' :
              graphStyle === 'pastel' ? 'bg-pink-100' :
              graphStyle === 'monochrome' ? 'bg-gray-800' :
              'bg-indigo-800'
            }`} />
          </div>
        ) : error ? (
          <div className={`w-full h-full flex items-center justify-center ${
            graphStyle === 'classic' ? 'text-gray-500' :
            graphStyle === 'neon' ? 'text-cyan-400' :
            graphStyle === 'pastel' ? 'text-pink-500' :
            graphStyle === 'monochrome' ? 'text-gray-400' :
            'text-indigo-200'
          }`}>
            <p className="text-sm">{error}</p>
          </div>
        ) : data.length === 0 ? (
          <div className={`w-full h-full flex items-center justify-center ${
            graphStyle === 'classic' ? 'text-gray-500' :
            graphStyle === 'neon' ? 'text-cyan-400' :
            graphStyle === 'pastel' ? 'text-pink-500' :
            graphStyle === 'monochrome' ? 'text-gray-400' :
            'text-indigo-200'
          }`}>
            <p className="text-sm">ไม่พบข้อมูล</p>
          </div>
        ) : (
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
                      fill: graphStyle === "monochrome" || graphStyle === "neon" || graphStyle === "gradient" ? "rgba(255,255,255,0.7)" : "#666"
                    }}
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

