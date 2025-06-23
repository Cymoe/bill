import React from 'react';
import { ChevronDown } from 'lucide-react';

interface TableHeaderProps {
  priceSort: 'asc' | 'desc';
  onPriceSort: () => void;
}

const TableHeader: React.FC<TableHeaderProps> = ({ priceSort, onPriceSort }) => (
  <thead className="bg-gray-800">
    <tr>
      <th className="pl-4 pr-4 py-3 text-left text-xs font-medium text-[#A0AEC0] uppercase tracking-widest w-[20%]" data-testid="header-name">Name</th>
      <th className="pl-4 pr-4 py-3 text-left text-xs font-medium text-[#A0AEC0] uppercase tracking-widest w-[40%]" data-testid="header-description">Description</th>
      <th className="py-3 pr-3 text-right text-xs font-medium text-[#A0AEC0] uppercase tracking-widest cursor-pointer select-none" data-testid="header-price">
        <button onClick={onPriceSort} className="flex items-center gap-1 justify-end w-full text-[#A0AEC0] uppercase font-medium text-xs focus:outline-none">
          <span>Price</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${priceSort === 'asc' ? 'rotate-180' : ''}`} />
        </button>
      </th>
      <th className="py-3 pl-2 text-left text-xs font-medium text-[#A0AEC0] uppercase tracking-widest w-[120px]" data-testid="header-unit">Unit</th>
      <th className="py-3 pr-3 text-center text-xs font-medium text-[#A0AEC0] uppercase tracking-widest w-[120px]" data-testid="header-type" style={{textAlign: 'center'}}>Type</th>
    </tr>
  </thead>
);

export default TableHeader; 