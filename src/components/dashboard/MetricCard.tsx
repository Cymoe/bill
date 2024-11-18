import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend: number;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, trend }) => {
  const isPositive = trend >= 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 md:p-6">
      <div className="flex justify-between items-start mb-2 md:mb-4">
        <div className="p-1.5 md:p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
          <Icon className="w-4 h-4 md:w-6 md:h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
      </div>
      <h3 className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</h3>
      <div className="mt-1 md:mt-2 flex items-baseline">
        <p className="text-lg md:text-2xl font-semibold text-gray-900 dark:text-white truncate">{value}</p>
        <p className={`ml-1 md:ml-2 text-xs md:text-sm font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {isPositive ? '+' : ''}{trend}%
        </p>
      </div>
    </div>
  );
};
