import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface RevenueChartProps {
  data: Array<{ month: string; amount: number }>;
  title: string;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data, title }) => {
  return (
    <div>
      <h2 className="text-lg font-bold text-white font-['Roboto_Condensed'] uppercase mb-4">{title}</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#333333"
              vertical={false}
            />
            <XAxis 
              dataKey="month" 
              stroke="#9E9E9E"
              tick={{ fontFamily: 'Roboto', fontSize: 12 }}
              axisLine={{ stroke: '#333333' }}
              tickLine={{ stroke: '#333333' }}
            />
            <YAxis 
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              stroke="#9E9E9E"
              tick={{ fontFamily: 'Roboto Mono', fontSize: 12 }}
              axisLine={{ stroke: '#333333' }}
              tickLine={{ stroke: '#333333' }}
            />
            <Tooltip 
              formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']}
              contentStyle={{ 
                background: '#1E1E1E',
                border: '1px solid #333333',
                color: '#FFFFFF',
                fontFamily: 'Roboto',
                borderRadius: '4px'
              }}
              labelStyle={{
                fontFamily: 'Roboto Condensed',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}
            />
            <Bar 
              dataKey="amount" 
              fill="#336699" 
              radius={[4, 4, 0, 0]}
              barSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};