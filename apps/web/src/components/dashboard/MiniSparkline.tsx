import React from 'react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';

interface MiniSparklineProps {
  data: Array<{ date: string; amount: number }>;
}

export const MiniSparkline: React.FC<MiniSparklineProps> = ({ data }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <ResponsiveContainer width="100%" height={50}>
      <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
        <Area
          type="monotone"
          dataKey="amount"
          stroke={isDark ? '#60A5FA' : '#2563EB'}
          fill={isDark ? 'rgba(96, 165, 250, 0.1)' : 'rgba(37, 99, 235, 0.1)'}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};