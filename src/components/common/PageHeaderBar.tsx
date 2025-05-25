import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useProductDrawer } from '../../contexts/ProductDrawerContext';

interface PageHeaderBarProps {
  title: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  searchValue?: string;
  showSearch?: boolean;
  showAddButton?: boolean;
  addButtonLabel?: string;
  onAddClick?: () => void;
}

export const PageHeaderBar: React.FC<PageHeaderBarProps> = ({
  title,
  searchPlaceholder = "Search...",
  onSearch,
  searchValue = "",
  showSearch = true,
  showAddButton = true,
  addButtonLabel,
  onAddClick
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { openProductDrawer } = useProductDrawer();
  
  // Determine the add button label based on current path if not provided
  const getAddButtonLabel = () => {
    if (addButtonLabel) return addButtonLabel;
    
    const path = location.pathname;
    if (path.startsWith('/products')) return 'Product';
    if (path.startsWith('/invoices')) return 'Invoice';
    if (path.startsWith('/projects')) return 'Project';
    if (path.startsWith('/clients')) return 'Client';
    if (path.startsWith('/price-book')) return 'Price Book';
    return 'Item';
  };

  // Default add button click handler based on current path
  const handleAddClick = () => {
    if (onAddClick) {
      onAddClick();
      return;
    }

    const path = location.pathname;
    if (path.startsWith('/clients')) {
      // This will be handled by parent component
    } else if (path.startsWith('/products')) {
      openProductDrawer();
    } else if (path.startsWith('/invoices')) {
      // This will be handled by parent component
    } else if (path.startsWith('/projects')) {
      navigate('/projects/new');
    }
  };

  return (
    <div className="px-8 py-6 border-b border-[#333333] flex justify-between items-center">
      <h1 className="text-2xl font-semibold text-white">{title}</h1>
      <div className="flex items-center gap-4">
        {showSearch && (
          <div className="relative">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearch?.(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-80 h-10 px-4 pr-10 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#336699] focus:border-transparent"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          </div>
        )}
        {showAddButton && (
          <button
            onClick={handleAddClick}
            className="h-10 px-4 bg-[#fbbf24] hover:bg-[#f59e0b] text-black font-medium rounded-lg transition-all duration-200 hover:transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {getAddButtonLabel()}
          </button>
        )}
      </div>
    </div>
  );
}; 