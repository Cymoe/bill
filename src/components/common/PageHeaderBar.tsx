import React, { useState, useRef, useEffect } from 'react';
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
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
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

  // Handle search expansion
  const handleSearchClick = () => {
    setIsSearchExpanded(true);
    // Wait for animation to mostly complete before focusing
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 200);
  };

  // Handle search blur - collapse if empty with delay to prevent flicker
  const handleSearchBlur = (e: React.FocusEvent) => {
    // Use setTimeout to allow for potential refocus (like clicking the search icon)
    setTimeout(() => {
      if (!searchValue && document.activeElement !== searchInputRef.current) {
        setIsSearchExpanded(false);
      }
    }, 150);
  };

  // Auto-expand if there's a search value
  useEffect(() => {
    if (searchValue) {
      setIsSearchExpanded(true);
    }
  }, [searchValue]);

  return (
    <div className="px-8 py-6 border-b border-[#333333] flex justify-between items-center">
      <h1 className="text-2xl font-semibold text-white">{title}</h1>
      <div className="flex items-center gap-4">
        {showSearch && (
          <div className="relative flex-shrink-0">
            <div 
              className={`bg-[#1a1a1a] border border-[#333333] rounded-lg flex items-center transition-all duration-300 ease-out overflow-hidden ${
                isSearchExpanded ? 'w-80' : 'w-10'
              } h-10`}
            >
              {/* Search icon - always present */}
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                {!isSearchExpanded ? (
                  <button
                    onClick={handleSearchClick}
                    className="w-full h-full flex items-center justify-center hover:bg-[#2a2a2a] transition-colors duration-200 rounded-lg"
                    tabIndex={0}
                  >
                    <Search className="w-4 h-4 text-gray-500" />
                  </button>
                ) : (
                  <Search className="w-4 h-4 text-gray-500 pointer-events-none" />
                )}
              </div>
              
              {/* Input field - only rendered when expanded */}
              {isSearchExpanded && (
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchValue}
                  onChange={(e) => onSearch?.(e.target.value)}
                  onBlur={handleSearchBlur}
                  placeholder={searchPlaceholder}
                  className="flex-1 h-full px-3 pr-4 bg-transparent text-white placeholder-gray-500 focus:outline-none border-none"
                  style={{ minWidth: 0 }} // Prevents input from forcing container width
                />
              )}
            </div>
            
            {/* Focus ring overlay - only when expanded and focused */}
            {isSearchExpanded && (
              <div className="absolute inset-0 rounded-lg ring-2 ring-[#336699] ring-opacity-0 focus-within:ring-opacity-100 transition-opacity duration-200 pointer-events-none" />
            )}
          </div>
        )}
        {showAddButton && (
          <button
            onClick={handleAddClick}
            className="h-10 px-4 bg-[#fbbf24] hover:bg-[#f59e0b] text-black font-medium rounded-lg transition-all duration-200 hover:transform hover:-translate-y-0.5 flex items-center gap-2 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            {getAddButtonLabel()}
          </button>
        )}
      </div>
    </div>
  );
}; 