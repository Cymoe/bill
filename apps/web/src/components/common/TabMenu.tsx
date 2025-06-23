import React, { useState } from 'react';
import { MoreVertical } from 'lucide-react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface TabMenuProps {
  items?: TabItem[];
  tabs?: TabItem[];
  activeItemId?: string;
  activeTab?: string;
  onItemClick?: (id: string) => void;
  onTabChange?: (id: string) => void;
  showOptionsMenu?: boolean;
  onOptionsClick?: () => void;
}

export const TabMenu: React.FC<TabMenuProps> = (props) => {
  // Handle both naming conventions without changing the component's behavior
  const items = props.items || props.tabs || [];
  const activeItemId = props.activeItemId || props.activeTab || '';
  const onItemClick = props.onItemClick || props.onTabChange || (() => {});
  
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  
  const activeIndex = items.findIndex(item => item.id === activeItemId);
  const hoveredIndex = items.findIndex(item => item.id === hoveredItemId);
  
  return (
    <div className="bg-[#121212] border-b border-[#333333] relative">
      <div className="flex overflow-x-auto justify-between">
      <div className="flex">
          {items.map((item, index) => (
          <button 
            key={item.id}
            onClick={(e) => {
              e.stopPropagation();
              onItemClick(item.id);
            }}
              onMouseEnter={() => setHoveredItemId(item.id)}
              onMouseLeave={() => setHoveredItemId(null)}
            className={`${
              activeItemId === item.id
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              } pb-3 text-sm font-medium flex items-center justify-center whitespace-nowrap ${item.id === 'subcontractor' ? 'w-[160px]' : 'w-[134px]'} py-3 px-4 md:px-8 first:pl-4 md:first:pl-8 last:pr-4 md:last:pr-8`}
          >
            {item.label} 
            {item.count !== undefined && (
                <span className="ml-2 text-xs bg-[#333333] rounded-full px-2 py-0.5 text-white">
                {item.count}
              </span>
            )}
          </button>
        ))}
      </div>
      {props.onOptionsClick && (
          <div className="px-4 md:px-8">
        <button
          onClick={props.onOptionsClick}
              className="p-2 rounded-full hover:bg-[#252525] transition-colors"
          aria-label="More options"
        >
          <MoreVertical size={20} className="text-gray-400" />
        </button>
          </div>
        )}
      </div>
      
      {/* Active underline positioned to cover the border and extend to container edge */}
      {activeIndex >= 0 && (
        <div 
          className={`absolute bottom-0 left-0 h-1 bg-[#336699] z-20 ${activeIndex === 0 ? 'rounded-tl-[4px]' : ''}`}
          style={{
            width: activeIndex === 0 
              ? `${items[activeIndex]?.id === 'subcontractor' ? 160 : 134}px`
              : `${items[activeIndex]?.id === 'subcontractor' ? 160 : 134}px`,
            left: activeIndex === 0 
              ? '0px'
              : `${items.slice(0, activeIndex).reduce((acc, item) => acc + (item.id === 'subcontractor' ? 160 : 134), 0)}px`
          }}
        />
      )}
      
      {/* Hover underline - only show if hovering over a different tab than active */}
      {hoveredIndex >= 0 && hoveredItemId !== activeItemId && (
        <div 
          className={`absolute bottom-0 left-0 h-1 bg-[#336699] z-10 ${hoveredIndex === 0 ? 'rounded-tl-[4px]' : ''}`}
          style={{
            width: hoveredIndex === 0 
              ? `${items[hoveredIndex]?.id === 'subcontractor' ? 160 : 134}px`
              : `${items[hoveredIndex]?.id === 'subcontractor' ? 160 : 134}px`,
            left: hoveredIndex === 0 
              ? '0px'
              : `${items.slice(0, hoveredIndex).reduce((acc, item) => acc + (item.id === 'subcontractor' ? 160 : 134), 0)}px`
          }}
        />
      )}
    </div>
  );
};

export default TabMenu;
