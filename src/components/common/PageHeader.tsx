import React from 'react';
import { Search, Filter, MoreVertical } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  searchValue: string;
  onSearchChange: (v: string) => void;
  onFilter?: () => void;
  onMenu?: () => void;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  searchValue,
  onSearchChange,
  onFilter,
  onMenu,
  children,
}) => (
  <div className="flex flex-col md:flex-row md:justify-between md:items-center px-8 pt-8 pb-4 border-b border-gray-800 bg-transparent">
    <div>
      <h1 className="text-3xl font-bold text-white mb-1">{title}</h1>
      {subtitle && <p className="text-gray-400 text-base font-normal">{subtitle}</p>}
    </div>
    <div className="flex items-center gap-3 mt-4 md:mt-0">
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder={`Search ${title.toLowerCase()}...`}
          value={searchValue}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      {onFilter && (
        <button
          onClick={onFilter}
          className="flex items-center gap-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Filter className="w-5 h-5 mr-1" />
          <span>Filter</span>
        </button>
      )}
      {onMenu && (
        <button
          onClick={onMenu}
          className="p-2 rounded-lg hover:bg-gray-700 text-white transition-colors"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      )}
      {children}
    </div>
  </div>
);

export default PageHeader; 