import React from 'react';

const TableHeader: React.FC = () => (
  <thead className="bg-gray-50 dark:bg-gray-800">
    <tr>
      <th className="px-4 py-3 w-[200px] text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
      <th className="px-4 py-3 w-[400px] text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
      <th className="px-4 py-3 w-[120px] text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
      <th className="px-4 py-3 w-[120px] text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unit</th>
      <th className="px-4 py-3 w-[180px] text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
      <th className="px-4 py-3 w-[80px] text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
    </tr>
  </thead>
);

export default TableHeader; 