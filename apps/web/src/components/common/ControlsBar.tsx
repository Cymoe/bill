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
  const { isConstrained, isMinimal, isCompact } = useContext(LayoutContext);

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
      <div className={`${
        isMinimal ? 'px-4 py-2' : isConstrained ? 'px-4 py-2' : 'px-6 py-3 md:py-4'
      } flex items-center justify-between`}>
        {/* Left side - Filters */}
        <div className={`flex items-center ${isMinimal ? 'gap-2' : isConstrained ? 'gap-2' : 'gap-3'}`}>
          {primaryFilter && (
            <div className="relative">
              <select
                className={`bg-[#1E1E1E] border border-[#333333] rounded-[4px] text-white focus:outline-none focus:border-[#336699] appearance-none pr-8 ${
                  isMinimal 
                    ? 'px-2 py-1.5 text-xs min-w-[140px]' 
                    : isConstrained 
                      ? 'px-2 py-1.5 text-xs min-w-[160px]' 
                      : isCompact
                        ? 'px-3 py-2 text-sm min-w-[180px]'
                        : 'px-3 py-2 text-sm min-w-[200px]'
                }`}
                value={primaryFilter.value}
                onChange={(e) => primaryFilter.onChange(e.target.value)}
              >
                {primaryFilter.options.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.label} {option.count !== undefined ? `(${option.count})` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className={`absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none ${
                isMinimal ? 'w-3 h-3' : 'w-4 h-4'
              }`} />
            </div>
          )}
          
          {onToggleMoreFilters && (
            <div className="relative" ref={moreFiltersRef}>
              <button
                onClick={onToggleMoreFilters}
                className={`bg-[#1E1E1E] hover:bg-[#252525] text-white border border-[#333333] rounded-[4px] font-medium transition-colors flex items-center ${
                  isMinimal 
                    ? 'px-2 py-1.5 text-xs gap-1' 
                    : isConstrained 
                      ? 'px-2 py-1.5 text-xs gap-1.5' 
                      : 'px-3 py-2 text-sm gap-2'
                } ${showMoreFilters ? 'bg-[#252525]' : ''}`}
              >
                <Filter className={`${isMinimal ? 'w-3 h-3' : 'w-4 h-4'}`} />
                <span>{isMinimal ? 'More' : 'More Filters'}</span>
              </button>
              
              {/* More Filters Dropdown */}
              {showMoreFilters && moreFiltersContent && (
                <div className={`absolute top-full left-0 mt-1 bg-[#1E1E1E] border border-[#333333] rounded-[4px] shadow-lg z-50 ${
                  isMinimal 
                    ? 'right-0 left-auto w-[240px] p-2' 
                    : isConstrained 
                      ? 'right-0 left-auto w-[260px] p-3' 
                      : isCompact
                        ? 'w-[300px] p-3'
                        : 'w-80 p-3 md:p-4'
                }`}>
                  {moreFiltersContent}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Right side - View toggle and options */}
        <div className={`flex items-center ${isMinimal ? 'gap-1' : 'gap-2'}`}>
          {viewToggles && (
            <div className="flex bg-[#1E1E1E] border border-[#333333] rounded-[4px] overflow-hidden">
              {viewToggles.options.map((option) => (
                <button
                  key={option.id}
                  className={`font-medium transition-colors flex items-center justify-center ${
                    isMinimal 
                      ? 'px-2 py-1.5 text-xs' 
                      : isConstrained 
                        ? 'px-2 py-1.5 text-xs' 
                        : 'px-3 py-2 text-sm'
                  } ${
                    viewToggles.value === option.id ? 'bg-white text-[#121212]' : 'text-gray-400 hover:bg-[#252525]'
                  }`}
                  onClick={() => viewToggles.onChange(option.id)}
                  title={option.label}
                >
                  {option.icon && <span className={isMinimal ? 'w-3 h-3' : 'w-4 h-4'}>{option.icon}</span>}
                </button>
              ))}
            </div>
          )}
          
          {onToggleOptionsMenu && (
            <div className="relative" ref={optionsMenuRef}>
              <button 
                onClick={onToggleOptionsMenu}
                className={`bg-[#1E1E1E] border border-[#333333] rounded-[4px] flex items-center justify-center hover:bg-[#252525] transition-colors ${
                  isMinimal ? 'w-6 h-6' : isConstrained ? 'w-7 h-7' : 'w-8 h-8'
                }`}
              >
                <MoreVertical className={`text-gray-400 ${isMinimal ? 'w-3 h-3' : 'w-4 h-4'}`} />
              </button>

              {/* Options Dropdown */}
              {showOptionsMenu && optionsMenuSections && (
                <div className={`absolute top-full right-0 mt-1 bg-[#1E1E1E] border border-[#333333] rounded-[4px] shadow-lg z-50 py-1 ${
                  isMinimal ? 'w-[200px]' : isConstrained ? 'w-[220px]' : 'w-64'
                }`}>
                  {optionsMenuSections.map((section, sectionIndex) => (
                    <div key={sectionIndex}>
                      <div className="px-3 py-2 border-b border-[#333333]">
                        <div className={`font-medium text-gray-400 uppercase tracking-wide mb-2 ${
                          isMinimal ? 'text-xs' : 'text-xs'
                        }`}>
                          {section.title}
                        </div>
                        {section.actions.map((action) => (
                          <button
                            key={action.id}
                            onClick={action.onClick}
                            className={`w-full text-left px-2 py-2 hover:bg-[#336699] transition-colors flex items-center rounded-[2px] ${
                              isMinimal ? 'text-xs' : 'text-xs'
                            } ${getActionColorClass(action.color)}`}
                          >
                            {action.icon && <span className={`mr-2 ${isMinimal ? 'w-3 h-3' : 'w-3 h-3'}`}>{action.icon}</span>}
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