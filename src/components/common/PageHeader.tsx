import React from 'react';
import { Search, Filter, MoreVertical } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  showSearch?: boolean;
  onFilter?: () => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
  onMenu?: () => void;
  actionButton?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  searchValue = '',
  onSearchChange,
  showSearch = false,
  onFilter,
  searchPlaceholder,
  children,
  onMenu,
  actionButton,
}) => {

  return (
    <div className="pb-4 pt-4 px-4 border-b border-gray-800">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-medium leading-6 text-white">{title}</h3>
          {subtitle && (
            <p className="mt-2 text-sm text-gray-400">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {showSearch && (
            <div className="relative flex items-center gap-2 w-[280px] bg-[#232632] rounded-full overflow-hidden">
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="block w-full pl-10 pr-4 py-2 border-0 bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm"
                />
              </div>
              {onFilter && (
                <button
                  onClick={onFilter}
                  className="inline-flex items-center justify-center h-full px-4 py-2 text-white bg-[#1E293B] hover:bg-[#1A2234] transition-colors"
                  type="button"
                >
                  <Filter className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
          {actionButton ? (
            actionButton
          ) : onMenu ? (
            <button
              onClick={onMenu}
              className="p-2 text-gray-400 hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          ) : null}
        </div>
      </div>
      {children}
    </div>
  );
};
