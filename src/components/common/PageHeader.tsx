import React from 'react';
import { Search, Filter, MoreVertical } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  showSearch?: boolean;
  showFilter?: boolean;
  filterActive?: boolean;
  onFilter?: () => void;
  filterLabel?: string;
  searchPlaceholder?: string;
  onMenu?: () => void;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  searchValue = '',
  onSearchChange,
  showSearch = true,
  showFilter = false,
  filterActive = false,
  onFilter,
  filterLabel = 'Filter',
  searchPlaceholder,
  onMenu,
  children,
}) => (
  <div className="flex flex-col md:flex-row md:justify-between md:items-center px-8 pt-8 pb-4 border-b border-gray-800 bg-transparent">
    <div>
      <h1 className="text-3xl font-bold text-white mb-1">{title}</h1>
      {subtitle && <p className="text-gray-400 text-base font-normal">{subtitle}</p>}
    </div>
    <div className="flex items-center gap-3 mt-4 md:mt-0 w-full md:w-auto">
      {(showSearch || showFilter) && (
        <div className="flex w-full max-w-xl">
          {showSearch && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={searchPlaceholder || `Search ${title.toLowerCase()}...`}
                value={searchValue}
                onChange={e => onSearchChange && onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#232635] text-white border border-gray-700 border-r-0 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-accent text-base"
                style={{ height: 48 }}
              />
            </div>
          )}
          {showFilter && (
            <button
              className={`flex items-center gap-2 px-6 py-3 bg-[#232635] border border-gray-700 border-l-0 rounded-r-lg text-white hover:bg-[#232635]/80 transition-colors${filterActive ? ' ring-2 ring-accent' : ''}`}
              style={{ height: 48 }}
              onClick={onFilter}
              type="button"
            >
              <Filter className="w-5 h-5 text-blue-400" />
              <span className="font-medium">{filterLabel}</span>
            </button>
          )}
        </div>
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