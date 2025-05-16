
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SelectedGraph } from "../types";

// Define data point types for type safety
export interface ChartDataPoint {
  time: string;
  value: number;
  fullDate: string;
}

interface RiceQualityDataPoint {
  created_at: string;
  [key: string]: any; // Dynamic property for measurement values
}

export const useGraphData = (graph: SelectedGraph) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGraphData();
  }, [graph]);

  const fetchGraphData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use the graph.symbol as the column to select along with created_at
      const query = supabase
        .from("rice_quality_analysis")
        .select(`created_at, ${graph.symbol}`)
        .eq("device_code", graph.deviceCode)
        .order("created_at", { ascending: false })
        .limit(30);
      
      const { data: responseData, error: responseError } = await query;

      if (responseError) {
        console.error("Error fetching graph data:", responseError);
        setError("ไม่สามารถโหลดข้อมูลได้");
        setData([]);
        return;
      }

      if (!responseData || responseData.length === 0) {
        setError("ไม่พบข้อมูล");
        setData([]);
        return;
      }

      // Transform the data for the chart with proper type checking
      const chartData: ChartDataPoint[] = [];
      
      // Make sure we're dealing with actual data points from the response
      const validData = responseData as unknown as RiceQualityDataPoint[];
      
      for (const item of validData) {
        // Ensure the item exists and has the required properties
        if (item && 
            item[graph.symbol] !== undefined && 
            item[graph.symbol] !== null &&
            item.created_at) {
          
          const value = item[graph.symbol];
          // Handle object or primitive value
          const measurementValue = typeof value === 'object' ? 
            (value as any).value : value;
          
          // Format date for display
          const date = new Date(item.created_at);
          const formattedDate = `${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
          
          chartData.push({
            time: formattedDate,
            value: Number(measurementValue),
            fullDate: item.created_at
          });
        }
      }
      
      // Reverse to display oldest to newest
      chartData.reverse();
      setData(chartData);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("เกิดข้อผิดพลาดที่ไม่คาดคิด");
    } finally {
      setLoading(false);
    }
  };

  return { loading, data, error };
};
