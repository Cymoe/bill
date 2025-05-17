import React from 'react';

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
}

export const TabMenu: React.FC<TabMenuProps> = (props) => {
  // Handle both naming conventions without changing the component's behavior
  const items = props.items || props.tabs || [];
  const activeItemId = props.activeItemId || props.activeTab || '';
  const onItemClick = props.onItemClick || props.onTabChange || (() => {});
  
  return (
    <div className="flex border-b border-gray-800 overflow-x-auto pb-0 gap-0">
      {items.map((item) => (
        <button 
          key={item.id}
          onClick={() => onItemClick(item.id)}
          className={`${activeItemId === item.id ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white hover:text-blue-500 hover:border-b-2 hover:border-blue-500'} pb-3 text-sm font-medium flex items-center justify-center whitespace-nowrap w-[134px] py-3`}
        >
          {item.label} 
          {item.count !== undefined && (
            <span className={`ml-2 text-xs bg-gray-800 rounded-full px-2 py-0.5 ${activeItemId === item.id ? 'text-blue-500' : 'text-gray-400'}`}>
              {item.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default TabMenu;
