import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
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
  Legend,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ChartContainer, 
  ChartTooltip,
  ChartTooltipContent 
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
        .select(`created_at, ${graph.symbol}`)
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

      // Transform the data for the chart
      const chartData = data
        .filter(item => item[graph.symbol] !== undefined && item[graph.symbol] !== null)
        .map(item => {
          const value = item[graph.symbol];
          const measurementValue = typeof value === 'object' ? 
            (value as any).value : value;
          
          // Format date for display
          const date = new Date(item.created_at);
          const formattedDate = `${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
          
          return {
            time: formattedDate,
            value: Number(measurementValue),
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

  return (
    <Card className="shadow-md overflow-hidden">
      <CardHeader className="bg-gray-50 border-b border-gray-200 py-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-medium text-gray-800">
              {graph.name}
            </CardTitle>
            <p className="text-xs text-gray-500">
              อุปกรณ์: {graph.deviceName}
            </p>
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
                  stroke={getColor()}
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
