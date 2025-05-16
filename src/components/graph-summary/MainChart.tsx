
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { GraphTooltip } from "./GraphTooltip";
import { GraphLegend } from "./GraphLegend";
import { SelectedMetric } from "./types";

interface MainChartProps {
  graphData: any[];
  selectedMetrics: SelectedMetric[];
}

export const MainChart: React.FC<MainChartProps> = ({
  graphData,
  selectedMetrics
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={graphData}
        margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="time" 
          tick={{ fontSize: 12, fill: '#64748b' }}
        />
        <YAxis 
          tick={{ fontSize: 12, fill: '#64748b' }}
        />
        <Tooltip 
          content={(props) => <GraphTooltip {...props} selectedMetrics={selectedMetrics} />}
        />
        <Legend 
          content={(props) => <GraphLegend payload={props.payload || []} selectedMetrics={selectedMetrics} />}
        />
        {selectedMetrics.map((metric) => (
          <Line
            key={`${metric.deviceCode}_${metric.symbol}`}
            type="monotone"
            dataKey={`${metric.deviceCode}_${metric.symbol}`}
            name={`${metric.name} (${metric.deviceName})`}
            stroke={metric.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, stroke: metric.color, strokeWidth: 1, fill: 'white' }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};
