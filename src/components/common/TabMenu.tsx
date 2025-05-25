import React from 'react';
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
  
  return (
    <div className="flex border-b border-gray-800 overflow-x-auto pb-0 gap-0 justify-between">
      <div className="flex">
        {items.map((item) => (
          <button 
            key={item.id}
            onClick={(e) => {
              e.stopPropagation();
              onItemClick(item.id);
            }}
            className={`${
              activeItemId === item.id
                ? 'text-white border-b-2 border-steel-blue'
                : 'text-gray-400 hover:text-white hover:border-b-2 hover:border-steel-blue'
            } pb-3 text-sm font-medium flex items-center justify-center whitespace-nowrap ${item.id === 'subcontractor' ? 'w-[160px]' : 'w-[134px]'} py-3`}
          >
            {item.label} 
            {item.count !== undefined && (
              <span className="ml-2 text-xs bg-gray-800 rounded-full px-2 py-0.5 text-white">
                {item.count}
              </span>
            )}
          </button>
        ))}
      </div>
      {props.onOptionsClick && (
        <button
          onClick={props.onOptionsClick}
          className="p-2 rounded-full hover:bg-[#232323] transition-colors"
          aria-label="More options"
        >
          <MoreVertical size={20} className="text-gray-400" />
        </button>
      )}
    </div>
  );
};

export default TabMenu;
