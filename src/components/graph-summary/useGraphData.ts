
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SelectedMetric } from "./types";
import { TimeFrame } from "@/components/measurement-history/MeasurementHistory";
import { getTimeFrameHours } from "@/components/measurement-history/api";

export const useGraphData = (selectedMetrics: SelectedMetric[], timeFrame: TimeFrame) => {
  const [graphData, setGraphData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // When selectedMetrics changes, fetch the data for all metrics
  useEffect(() => {
    if (selectedMetrics.length > 0) {
      fetchGraphData();
    } else {
      setGraphData([]);
    }
  }, [selectedMetrics, timeFrame]);
  
  // Function to fetch data for all selected metrics
  const fetchGraphData = async () => {
    setLoading(true);

    try {
      // Calculate cutoff date based on timeframe
      const hours = getTimeFrameHours(timeFrame);
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - hours);

      // Fetch data for each device
      const deviceDataPromises = selectedMetrics.map(async (metric) => {
        const { data, error } = await supabase
          .from("rice_quality_analysis")
          .select("*")
          .eq("device_code", metric.deviceCode)
          .gt("created_at", cutoffDate.toISOString())
          .order("created_at", { ascending: true });

        if (error) {
          console.error(`Error fetching data for ${metric.deviceName}:`, error);
          return [];
        }

        return data || [];
      });

      const allDeviceData = await Promise.all(deviceDataPromises);

      // Combine and structure the data for the graph
      const combinedData: Record<string, any> = {};

      // Process data from each device
      allDeviceData.forEach((deviceData, deviceIndex) => {
        const metric = selectedMetrics[deviceIndex];
        
        deviceData.forEach(item => {
          const date = new Date(item.created_at);
          const timeKey = date.toISOString(); // Use ISO string as key for exact matching
          
          if (!combinedData[timeKey]) {
            combinedData[timeKey] = {
              time: `${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`,
              timestamp: date.getTime(),
            };
          }
          
          // Add this metric's value to the data point
          // Use deviceCode_symbol as key to ensure uniqueness
          const dataKey = `${metric.deviceCode}_${metric.symbol}`;
          combinedData[timeKey][dataKey] = Number(item[metric.symbol]);
        });
      });

      // Convert to array and sort by timestamp
      const dataArray = Object.values(combinedData)
        .sort((a, b) => a.timestamp - b.timestamp);
      
      setGraphData(dataArray);
    } catch (err) {
      console.error("Error fetching graph data:", err);
    } finally {
      setLoading(false);
    }
  };
  
  return { graphData, loading, fetchGraphData };
};
