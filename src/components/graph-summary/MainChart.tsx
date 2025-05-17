
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

export const MainChart: React.FC<MainChartProps> = ({ graphData, selectedMetrics, graphStyle, globalLineColor }) => {
  // ฟังก์ชันเพื่อกำหนดสีพื้นหลังตามสไตล์
  const getGradientOffset = () => {
    if (graphStyle === 'classic') {
      return { offset1: '5%', offset2: '95%' };
    } else if (graphStyle === 'natural') {
      return { offset1: '10%', offset2: '90%' };
    } else if (graphStyle === 'gradient') {
      return { offset1: '30%', offset2: '70%' };
    }
    return { offset1: '5%', offset2: '95%' };
  };
  
  const { offset1, offset2 } = getGradientOffset();
  
  // เลือกใช้ LineChart หรือ AreaChart ตามสไตล์
  const isAreaChart = ['area', 'natural', 'gradient', 'pastel'].includes(graphStyle);

  return (
    <ResponsiveContainer width="100%" height="100%">
      {isAreaChart ? (
        <AreaChart data={graphData}>
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
            tickFormatter={(time) => {
              const date = new Date(time);
              return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
            }}
            tick={{ fontSize: 12 }}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            labelFormatter={(time) => {
              const date = new Date(time);
              return `${date.toLocaleDateString()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
            }}
            formatter={(value: number) => [value.toFixed(2), '']}
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
            />
          ))}
          {/* เส้นค่าเฉลี่ยโดยรวม */}
          <Area
            type="monotone"
            dataKey="average"
            name="ค่าเฉลี่ยรวม"
            stroke={globalLineColor}
            strokeWidth={2}
            strokeDasharray="5 5"
            fill="none"
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      ) : (
        <LineChart data={graphData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={(time) => {
              const date = new Date(time);
              return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
            }}
            tick={{ fontSize: 12 }}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            labelFormatter={(time) => {
              const date = new Date(time);
              return `${date.toLocaleDateString()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
            }}
            formatter={(value: number) => [value.toFixed(2), '']}
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
            />
          ))}
          {/* เส้นค่าเฉลี่ยโดยรวม */}
          <Line
            type="monotone"
            dataKey="average"
            name="ค่าเฉลี่ยรวม"
            stroke={globalLineColor}
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      )}
    </ResponsiveContainer>
  );
};
