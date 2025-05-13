import React from 'react';

const TableHeader: React.FC = () => (
  <thead className="bg-gray-50 dark:bg-gray-800">
    <tr>
      <th className="pl-8 pr-4 py-3 w-[25%] text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border border-gray-200 dark:border-gray-700">Name</th>
      <th className="pl-8 pr-4 py-3 w-[35%] text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border border-gray-200 dark:border-gray-700">Description</th>
      <th className="pl-8 pr-4 py-3 w-[12%] text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border border-gray-200 dark:border-gray-700">Price</th>
      <th className="px-4 py-3 w-[10%] text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border border-gray-200 dark:border-gray-700">Unit</th>
      <th className="px-4 py-3 w-[12%] text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border border-gray-200 dark:border-gray-700">Type</th>
      <th className="p-1 w-[5%] text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border border-gray-200 dark:border-gray-700">&nbsp;</th>
    </tr>
  </thead>
);

export default TableHeader; 