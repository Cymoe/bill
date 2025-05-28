import React, { useRef, useContext } from 'react';
import { ChevronDown, Filter, MoreVertical } from 'lucide-react';
import { LayoutContext } from '../layouts/DashboardLayout';

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

export interface ViewToggle {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface DropdownAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  color?: 'default' | 'green' | 'yellow' | 'red';
  separator?: boolean;
}

export interface DropdownSection {
  title: string;
  actions: DropdownAction[];
}

interface ControlsBarProps {
  // Left side - Filters
  primaryFilter?: {
    value: string;
    onChange: (value: string) => void;
    options: FilterOption[];
    placeholder?: string;
  };
  
  // More Filters dropdown
  showMoreFilters?: boolean;
  onToggleMoreFilters?: () => void;
  moreFiltersContent?: React.ReactNode;
  moreFiltersRef?: React.RefObject<HTMLDivElement>;
  
  // Right side - View toggles
  viewToggles?: {
    value: string;
    onChange: (value: string) => void;
    options: ViewToggle[];
  };
  
  // Options dropdown
  showOptionsMenu?: boolean;
  onToggleOptionsMenu?: () => void;
  optionsMenuSections?: DropdownSection[];
  optionsMenuRef?: React.RefObject<HTMLDivElement>;
  
  className?: string;
}

export const ControlsBar: React.FC<ControlsBarProps> = ({
  primaryFilter,
  showMoreFilters,
  onToggleMoreFilters,
  moreFiltersContent,
  moreFiltersRef,
  viewToggles,
  showOptionsMenu,
  onToggleOptionsMenu,
  optionsMenuSections,
  optionsMenuRef,
  className = ''
}) => {
  const { isConstrained } = useContext(LayoutContext);

  const getActionColorClass = (color?: string) => {
    switch (color) {
      case 'green':
        return 'text-green-400';
      case 'yellow':
        return 'text-yellow-400';
      case 'red':
        return 'text-red-400';
      default:
        return 'text-white';
    }
  };

  return (
    <div className={`bg-[#121212] ${className}`}>
      <div className="py-3 md:py-4 flex items-center justify-between">
        {/* Left side - Filters */}
        <div className="flex items-center gap-3">
          {primaryFilter && (
            <div className="relative">
              <select
                className="bg-[#1E1E1E] border border-[#333333] rounded-[4px] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699] appearance-none pr-10 min-w-[200px]"
                value={primaryFilter.value}
                onChange={(e) => primaryFilter.onChange(e.target.value)}
              >
                {primaryFilter.options.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.label} {option.count !== undefined ? `(${option.count})` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          )}
          
          {onToggleMoreFilters && (
            <div className="relative" ref={moreFiltersRef}>
              <button
                onClick={onToggleMoreFilters}
                className={`px-3 py-2 bg-[#1E1E1E] hover:bg-[#252525] text-white border border-[#333333] rounded-[4px] text-sm font-medium transition-colors flex items-center gap-2 ${showMoreFilters ? 'bg-[#252525]' : ''}`}
              >
                <Filter className="w-4 h-4" />
                <span>More Filters</span>
              </button>
              
              {/* More Filters Dropdown */}
              {showMoreFilters && moreFiltersContent && (
                <div className={`absolute top-full left-0 mt-1 ${isConstrained ? 'right-0 left-auto w-[280px]' : 'w-80'} bg-[#1E1E1E] border border-[#333333] rounded-[4px] shadow-lg z-50 p-3 md:p-4`}>
                  {moreFiltersContent}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Right side - View toggle and options */}
        <div className="flex items-center gap-2">
          {viewToggles && (
            <div className="flex bg-[#1E1E1E] border border-[#333333] rounded-[4px] overflow-hidden">
              {viewToggles.options.map((option) => (
                <button
                  key={option.id}
                  className={`px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                    viewToggles.value === option.id ? 'bg-white text-[#121212]' : 'text-gray-400 hover:bg-[#252525]'
                  }`}
                  onClick={() => viewToggles.onChange(option.id)}
                >
                  {option.icon}
                  {option.label}
                </button>
              ))}
            </div>
          )}
          
          {onToggleOptionsMenu && (
            <div className="relative" ref={optionsMenuRef}>
              <button 
                onClick={onToggleOptionsMenu}
                className="bg-[#1E1E1E] border border-[#333333] rounded-[4px] w-8 h-8 flex items-center justify-center hover:bg-[#252525] transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>

              {/* Options Dropdown */}
              {showOptionsMenu && optionsMenuSections && (
                <div className={`absolute top-full right-0 mt-1 ${isConstrained ? 'w-[240px]' : 'w-64'} bg-[#1E1E1E] border border-[#333333] rounded-[4px] shadow-lg z-50 py-1`}>
                  {optionsMenuSections.map((section, sectionIndex) => (
                    <div key={sectionIndex}>
                      <div className="px-3 py-2 border-b border-[#333333]">
                        <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                          {section.title}
                        </div>
                        {section.actions.map((action) => (
                          <button
                            key={action.id}
                            onClick={action.onClick}
                            className={`w-full text-left px-2 py-2 text-xs hover:bg-[#336699] transition-colors flex items-center rounded-[2px] ${getActionColorClass(action.color)}`}
                          >
                            {action.icon && <span className="w-3 h-3 mr-2">{action.icon}</span>}
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 