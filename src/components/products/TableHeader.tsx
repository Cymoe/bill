import React from 'react';

const TableHeader: React.FC = () => (
  <thead className="bg-gray-800">
    <tr>
      <th className="pl-8 pr-4 py-3 text-left text-xs font-medium text-[#A0AEC0] uppercase tracking-widest w-[20%]" data-testid="header-name">Name</th>
      <th className="pl-8 pr-4 py-3 text-left text-xs font-medium text-[#A0AEC0] uppercase tracking-widest w-[55%]" data-testid="header-description">Description</th>
      <th className="py-3 pr-3 text-right text-xs font-medium text-[#A0AEC0] uppercase tracking-widest" data-testid="header-price">Price</th>
      <th className="py-3 pl-2 text-left text-xs font-medium text-[#A0AEC0] uppercase tracking-widest w-[120px]" data-testid="header-unit">Unit</th>
    </tr>
  </thead>
);

export default TableHeader; 