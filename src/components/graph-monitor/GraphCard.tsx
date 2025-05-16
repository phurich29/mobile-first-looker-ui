
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

interface GraphCardProps {
  graph: SelectedGraph;
  onRemove: () => void;
}

export const GraphCard: React.FC<GraphCardProps> = ({ graph, onRemove }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("24h");

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
              <SelectTrigger className="h-7 w-28 text-xs border-gray-200 bg-white">
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
      <CardContent className="p-4 h-64">
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
                  stroke={getIconColor()}
                  activeDot={{ r: 6 }}
                  strokeWidth={2}
                  name={graph.name}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-purple-100 shadow-md rounded-md">
        <p className="text-xs font-medium">{label}</p>
        <p className="text-xs text-gray-600">{`${payload[0].name}: ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

