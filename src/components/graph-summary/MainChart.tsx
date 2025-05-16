
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
  Area,
  ReferenceLine,
} from "recharts";
import { GraphTooltip } from "./GraphTooltip";
import { GraphLegend } from "./GraphLegend";
import { GraphStyleOptions, SelectedMetric } from "./types";

interface MainChartProps {
  graphData: any[];
  selectedMetrics: SelectedMetric[];
  styleOptions?: GraphStyleOptions;
}

export const MainChart: React.FC<MainChartProps> = ({
  graphData,
  selectedMetrics,
  styleOptions = {}
}) => {
  // สไตล์เริ่มต้น - ถ้าไม่ระบุให้ใช้แบบเส้นธรรมดา
  const graphStyle = styleOptions.graphStyle || 'line';
  return (
    <ResponsiveContainer width="100%" height="100%">
      {graphStyle === 'area' ? (
        <AreaChart
          data={graphData}
          margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
        >
          {selectedMetrics.map((metric, index) => (
            <defs key={`defs-${metric.deviceCode}-${metric.symbol}`}>
              <linearGradient id={`colorValue-${metric.deviceCode}-${metric.symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={metric.color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={metric.color} stopOpacity={0.1} />
              </linearGradient>
              <filter id={`shadow-${metric.deviceCode}-${metric.symbol}`} height="200%">
                <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="rgba(0,0,0,0.1)" />
              </filter>
            </defs>
          ))}

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
            <Area
              key={`${metric.deviceCode}_${metric.symbol}`}
              type="monotone"
              dataKey={`${metric.deviceCode}_${metric.symbol}`}
              name={`${metric.name} (${metric.deviceName})`}
              stroke={metric.color}
              strokeWidth={2}
              fill={`url(#colorValue-${metric.deviceCode}-${metric.symbol})`}
              fillOpacity={0.9}
              dot={false}
              style={{ filter: `url(#shadow-${metric.deviceCode}-${metric.symbol})` }}
              activeDot={{ r: 6, stroke: metric.color, strokeWidth: 1, fill: 'white' }}
            />
          ))}
          
          {/* ถ้ามีเส้นค่าเฉลี่ยที่ต้องการแสดง สามารถเพิ่มได้ตรงนี้ */}
          {styleOptions.lineColor && (
            <ReferenceLine 
              y={0} /* สามารถกำหนดค่าเฉลี่ยที่ต้องการแสดง */
              stroke={styleOptions.lineColor}
              strokeWidth={2}
              strokeDasharray="3 3"
            />
          )}
        </AreaChart>
      ) : (
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
          
          {/* ถ้ามีเส้นค่าเฉลี่ยที่ต้องการแสดง สามารถเพิ่มได้ตรงนี้ */}
          {styleOptions.lineColor && (
            <ReferenceLine 
              y={0} /* สามารถกำหนดค่าเฉลี่ยที่ต้องการแสดง */
              stroke={styleOptions.lineColor}
              strokeWidth={2}
              strokeDasharray="3 3"
            />
          )}
        </LineChart>
      )}
    </ResponsiveContainer>
  );
};
