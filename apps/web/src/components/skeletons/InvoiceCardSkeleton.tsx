import React from 'react';

export const InvoiceCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-3 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="w-48 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      <div className="flex justify-end">
        <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  );
};