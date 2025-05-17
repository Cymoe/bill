import React from 'react';
import { ChevronDown } from 'lucide-react';

interface TableHeaderProps {
  priceSort: 'asc' | 'desc';
  onPriceSortChange: (sort: 'asc' | 'desc') => void;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ priceSort, onPriceSortChange }) => (
  <div className="bg-[#1E2130] rounded-lg p-3 border border-gray-800">
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-4 text-xs font-medium text-[#A0AEC0] uppercase tracking-widest">
        Item Details
      </div>
      <div className="col-span-4 text-xs font-medium text-[#A0AEC0] uppercase tracking-widest">
        Category
      </div>
      <div className="col-span-4 text-right">
        <button 
          onClick={() => onPriceSortChange(priceSort === 'asc' ? 'desc' : 'asc')} 
          className="flex items-center gap-1 justify-end w-full text-[#A0AEC0] uppercase font-medium text-xs focus:outline-none"
        >
          <span>Price</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${priceSort === 'asc' ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </div>
  </div>
);
