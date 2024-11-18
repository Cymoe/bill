import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="w-1/3 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
      <div className="space-y-3">
        <div className="w-1/2 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="w-1/4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  );
};