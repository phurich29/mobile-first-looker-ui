
import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { calculateAverage, formatBangkokTime, getTimeFrameHours } from './api';
import { TimeFrame } from './MeasurementHistory';

type HistoryChartProps = {
  historyData: any[] | undefined;
  isLoading: boolean;
  symbol: string;
  timeFrame: TimeFrame;
};

const HistoryChart: React.FC<HistoryChartProps> = ({ 
  historyData, 
  isLoading, 
  symbol,
  timeFrame 
}) => {
  // Calculate average
  const average = useMemo(() => 
    calculateAverage(historyData || [], symbol), 
    [historyData, symbol]
  );

  // Prepare data for the chart
  const chartData = useMemo(() => {
    if (!historyData || historyData.length === 0) {
      // Create empty chart data with 0 values when no data is available
      const currentDate = new Date();
      const hours = getTimeFrameHours(timeFrame);
      
      // Create array with empty data points spread across the time frame
      const emptyData = [];
      for (let i = 0; i <= hours; i += Math.max(1, Math.floor(hours/5))) {
        const pointDate = new Date(currentDate);
        pointDate.setHours(pointDate.getHours() - (hours - i));
        
        const { thaiTime, thaiDate } = formatBangkokTime(pointDate.toISOString());
        
        emptyData.push({
          time: thaiTime,
          value: 0,
          date: thaiDate
        });
      }
      return emptyData;
    }
    
    return historyData
      .map((item: any) => ({
        time: formatBangkokTime(item.created_at || item.thai_datetime).thaiTime,
        value: (item as any)[symbol] !== null && (item as any)[symbol] !== undefined 
               ? (item as any)[symbol] : null,
        date: formatBangkokTime(item.created_at || item.thai_datetime).thaiDate
      }))
      .reverse();
  }, [historyData, symbol, timeFrame]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-emerald-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white rounded-lg shadow-lg border border-gray-200 p-2 hover:shadow-xl transition-shadow duration-300">
      <div className="h-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#e0e0e0" strokeWidth={1} />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10, fill: '#64748b' }} 
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis 
              domain={['auto', 'auto']} 
              tick={{ fontSize: 10, fill: '#64748b' }} 
              tickFormatter={(value) => `${value}%`}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-2 border border-gray-200 rounded-md shadow-lg">
                      <p className="text-xs font-medium">{`เวลา: ${payload[0].payload.time} น.`}</p>
                      <p className="text-xs font-medium text-[#9b87f5]">{`ค่า: ${payload[0].value}%`}</p>
                      <p className="text-xs text-gray-500">{payload[0].payload.date}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine 
              y={average} 
              stroke="#F97316" 
              strokeDasharray="3 3"
              label={{
                position: 'top',
                value: `ค่าเฉลี่ย: ${average.toFixed(2)}% (ช่วง ${(average * 0.95).toFixed(2)} - ${(average * 1.05).toFixed(2)}%)`,
                fill: '#F97316',
                fontSize: 12,
                offset: 0,
                dy: -10,
                dx: 150,
                textAnchor: 'end'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#9b87f5" 
              strokeWidth={2}
              dot={false}
              activeDot={false}
              animationDuration={500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HistoryChart;
