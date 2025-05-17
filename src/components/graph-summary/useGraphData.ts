
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SelectedMetric } from "./types";
import { TimeFrame } from "@/components/measurement-history/MeasurementHistory";
import { getTimeFrameHours } from "@/components/measurement-history/api";

export const useGraphData = (selectedMetrics: SelectedMetric[], timeFrame: TimeFrame) => {
  const [graphData, setGraphData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // When selectedMetrics changes, fetch notification settings and then the data
  useEffect(() => {
    if (selectedMetrics.length > 0) {
      fetchNotificationSettings();
    } else {
      setGraphData([]);
    }
  }, [selectedMetrics, timeFrame]);
  
  // Function to fetch notification settings for the selected metrics
  const fetchNotificationSettings = async () => {
    setLoading(true);
    try {
      // Create a copy of selected metrics to update with threshold values
      const updatedMetrics: SelectedMetric[] = [...selectedMetrics];
      
      // Fetch notification settings for each metric
      const settingsPromises = selectedMetrics.map(async (metric) => {
        const { data, error } = await supabase
          .from("notification_settings")
          .select("min_threshold, max_threshold, min_enabled, max_enabled")
          .eq("device_code", metric.deviceCode)
          .eq("rice_type_id", metric.symbol)
          .eq("enabled", true)
          .single();
        
        if (!error && data) {
          // Find the metric in our copy and update its thresholds
          const metricIndex = updatedMetrics.findIndex(
            m => m.deviceCode === metric.deviceCode && m.symbol === metric.symbol
          );
          
          if (metricIndex !== -1) {
            updatedMetrics[metricIndex] = {
              ...updatedMetrics[metricIndex],
              minThreshold: data.min_enabled ? data.min_threshold : null,
              maxThreshold: data.max_enabled ? data.max_threshold : null,
            };
          }
        }
        
        return data;
      });
      
      // Wait for all settings to be fetched
      await Promise.all(settingsPromises);
      
      // Update the metrics with thresholds
      selectedMetrics.forEach((metric, index) => {
        if (updatedMetrics[index].minThreshold !== undefined) {
          metric.minThreshold = updatedMetrics[index].minThreshold;
        }
        if (updatedMetrics[index].maxThreshold !== undefined) {
          metric.maxThreshold = updatedMetrics[index].maxThreshold;
        }
      });
      
      // Now fetch the actual graph data
      fetchGraphData();
    } catch (err) {
      console.error("Error fetching notification settings:", err);
      // Still fetch graph data even if settings fetch fails
      fetchGraphData();
    }
  };
  
  // Function to fetch data for all selected metrics
  const fetchGraphData = async () => {
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
  
  return { graphData, loading, fetchGraphData, fetchNotificationSettings };
};
