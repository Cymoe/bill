import React from 'react';
import { Rows3, List } from 'lucide-react';

export type ViewMode = 'compact' | 'list';

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  className?: string;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ 
  viewMode, 
  onViewModeChange, 
  className = "" 
}) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <button
      onClick={() => onViewModeChange('compact')}
      className={`p-1.5 rounded transition-colors ${
        viewMode === 'compact' 
          ? 'bg-[#2A2A2A] text-white' 
          : 'text-gray-400 hover:text-white'
      }`}
      title="Compact View"
    >
      <Rows3 className="w-4 h-4" />
    </button>
    <button
      onClick={() => onViewModeChange('list')}
      className={`p-1.5 rounded transition-colors ${
        viewMode === 'list' 
          ? 'bg-[#2A2A2A] text-white' 
          : 'text-gray-400 hover:text-white'
      }`}
      title="List View"
    >
      <List className="w-4 h-4" />
    </button>
  </div>
); 