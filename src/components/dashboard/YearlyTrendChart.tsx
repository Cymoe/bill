import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';

interface YearlyTrendChartProps {
  data: Array<{ year: string; amount: number }>;
  title: string;
}

export const YearlyTrendChart: React.FC<YearlyTrendChartProps> = ({ data, title }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={isDark ? '#374151' : '#E5E7EB'}
            />
            <XAxis 
              dataKey="year" 
              stroke={isDark ? '#9CA3AF' : '#4B5563'}
            />
            <YAxis 
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              stroke={isDark ? '#9CA3AF' : '#4B5563'}
            />
            <Tooltip 
              formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']}
              contentStyle={{ 
                background: isDark ? '#1F2937' : 'white',
                border: isDark ? '1px solid #374151' : '1px solid #E5E7EB',
                color: isDark ? '#F3F4F6' : '#111827'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke={isDark ? '#818CF8' : '#4F46E5'} 
              strokeWidth={2} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};