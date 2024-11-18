import React from 'react';

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 animate-pulse">
      <div className="w-48 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
      <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  );
};