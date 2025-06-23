import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2">
          <div className="w-48 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="w-2/3 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      
      <div className="flex items-baseline">
        <div className="w-24 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded ml-2"></div>
      </div>
    </div>
  );
};