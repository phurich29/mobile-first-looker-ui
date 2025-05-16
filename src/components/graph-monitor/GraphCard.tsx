
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

interface GraphCardProps {
  graph: SelectedGraph;
  onRemove: () => void;
}

export const GraphCard: React.FC<GraphCardProps> = ({ graph, onRemove }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGraphData();
  }, [graph]);

  const fetchGraphData = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("rice_quality_analysis")
        .select("*")  // Select all columns instead of specific measurements
        .eq("device_code", graph.deviceCode)
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

  // Get icon color based on measurement type
  const getIconColor = () => {
    // For class measurement types
    if (graph.symbol === "class1") return "#F7931A"; // amber/orange  
    if (graph.symbol === "class2") return "#627EEA"; // blue
    if (graph.symbol === "class3") return "#F3BA2F"; // yellow
    if (graph.symbol === "short_grain") return "#333333"; // dark gray
    if (graph.symbol === "slender_kernel") return "#4B9CD3"; // light blue
    
    // Colors for ingredients
    if (graph.symbol === "whole_kernels") return "#4CAF50"; // green
    if (graph.symbol === "head_rice") return "#2196F3"; // blue
    if (graph.symbol === "total_brokens") return "#FF9800"; // orange
    if (graph.symbol === "small_brokens") return "#9C27B0"; // purple
    if (graph.symbol === "small_brokens_c1") return "#795548"; // brown
    
    // Colors for impurities
    if (graph.symbol.includes("red")) return "#9b87f5"; // purple
    if (graph.symbol.includes("white")) return "#EEEEEE"; // light gray
    if (graph.symbol.includes("yellow")) return "#FFEB3B"; // yellow
    if (graph.symbol.includes("black")) return "#212121"; // almost black
    
    // Default to a generated color based on the symbol
    return getColor();
  };

  return (
    <Card className="shadow-md overflow-hidden">
      <CardHeader className="bg-gray-50 border-b border-gray-200 py-3">
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
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">ลบกราฟ</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 h-64">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <Skeleton className="h-full w-full" />
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
      <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md">
        <p className="text-xs font-medium">{label}</p>
        <p className="text-xs text-gray-600">{`${payload[0].name}: ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};
