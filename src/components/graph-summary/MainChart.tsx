
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
  AreaChart,
  Area
} from 'recharts';
import { SelectedMetric, GraphStyle } from './types';

interface MainChartProps {
  graphData: any[];
  selectedMetrics: SelectedMetric[];
  graphStyle: GraphStyle;
  globalLineColor: string;
}

// Utility function to format time with +7 hours offset
const formatTimeWithOffset = (timestamp: any) => {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  
  // Add 7 hours to match the timezone adjustment
  date.setHours(date.getHours() + 7);
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export const MainChart: React.FC<MainChartProps> = ({ graphData, selectedMetrics, graphStyle, globalLineColor }) => {
  // Format the data to ensure it uses the correct keys based on the selected metrics
  const formattedData = React.useMemo(() => {
    if (!graphData || graphData.length === 0) return [];
    
    return graphData.map(point => {
      const newPoint: any = { timestamp: point.timestamp };
      
      // Add each metric's value using the correct key format
      selectedMetrics.forEach(metric => {
        const key = `${metric.deviceCode}-${metric.symbol}`;
        const dataKey = `${metric.deviceCode}_${metric.symbol}`;
        newPoint[key] = point[dataKey]; // Map from stored format to display format
      });
      
      return newPoint;
    });
  }, [graphData, selectedMetrics]);

  const xAxisDomain: [any, any] = formattedData.length > 0 ? ['auto', 'auto'] : [0, 1];
  const yAxisDomain: [any, any] = formattedData.length > 0 ? ['auto', 'auto'] : [0, 1]; // Y-axis starts from 0 if data exists
  const xAxisType = formattedData.length > 0 ? undefined : 'number';

  const xAxisTickFormatter = (value: any) => {
    if (formattedData.length > 0 && xAxisType !== 'number') {
      return formatTimeWithOffset(value) || value.toString();
    }
    return value.toString(); // For empty data with domain [0,1] and type 'number'
  };

  // ฟังก์ชันเพื่อกำหนดสีพื้นหลังตามสไตล์
  // Simplified as GraphStyle is 'line' | 'area', and these offsets are for area charts.
  const getGradientOffset = () => {
    // Default offsets for area chart gradients
    return { offset1: '5%', offset2: '95%' };
  };
  
  const { offset1, offset2 } = getGradientOffset();
  
  // เลือกใช้ LineChart หรือ AreaChart ตามสไตล์
  // TODO: Address GraphStyle type mismatch in a separate step. For now, only 'area' will render AreaChart.
  const isAreaChart = graphStyle === 'area'; // ['area', 'natural', 'gradient', 'pastel'].includes(graphStyle);

  return (
    <ResponsiveContainer width="100%" height="100%">
      {isAreaChart ? (
        <AreaChart data={formattedData}>
          <defs>
            {selectedMetrics.map((metric) => (
              <linearGradient
                key={`gradient-${metric.deviceCode}-${metric.symbol}`}
                id={`color-${metric.deviceCode}-${metric.symbol}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset={offset1} stopColor={metric.color} stopOpacity={0.5} />
                <stop offset={offset2} stopColor={metric.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="timestamp" 
            type={xAxisType}
            domain={xAxisDomain}
            tickFormatter={xAxisTickFormatter}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            domain={yAxisDomain}
            tick={{ fontSize: 12 }} 
          />
          <Tooltip 
            labelFormatter={(time) => formatTimeWithOffset(time) || ''}
            formatter={(value: number) => [value?.toFixed(2) || '0', '']}
          />
          <Legend />
          {selectedMetrics.map((metric) => (
            <Area
              key={`${metric.deviceCode}-${metric.symbol}`}
              type="monotone"
              dataKey={`${metric.deviceCode}-${metric.symbol}`}
              name={`${metric.name} (${metric.deviceName})`}
              stroke={metric.color}
              strokeWidth={2}
              fill={`url(#color-${metric.deviceCode}-${metric.symbol})`}
              activeDot={{ r: 6 }}
              connectNulls={true}
            />
          ))}
        </AreaChart>
      ) : (
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="timestamp" 
            type={xAxisType}
            domain={xAxisDomain}
            tickFormatter={xAxisTickFormatter}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            domain={yAxisDomain}
            tick={{ fontSize: 12 }} 
          />
          <Tooltip 
            labelFormatter={(time) => formatTimeWithOffset(time) || ''}
            formatter={(value: number) => [value?.toFixed(2) || '0', '']}
          />
          <Legend />
          {selectedMetrics.map((metric) => (
            <Line
              key={`${metric.deviceCode}-${metric.symbol}`}
              type="monotone"
              dataKey={`${metric.deviceCode}-${metric.symbol}`}
              name={`${metric.name} (${metric.deviceName})`}
              stroke={metric.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
              connectNulls={true}
            />
          ))}
        </LineChart>
      )}
    </ResponsiveContainer>
  );
};
