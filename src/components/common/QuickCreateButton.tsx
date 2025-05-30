import React, { useEffect } from 'react';
import { Plus } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClick: () => void;
  isSidebarCollapsed?: boolean;
  isProjectsSidebarLocked?: boolean;
  isProjectsSidebarOpen?: boolean;
}

export const QuickCreateButton: React.FC<Props> = ({ 
  isOpen, 
  onClick,
  isSidebarCollapsed = false,
  isProjectsSidebarLocked = false,
  isProjectsSidebarOpen = false
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open with Cmd+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClick]);

  // Dynamic positioning based on sidebar states
  const rightPosition = isSidebarCollapsed 
    ? isProjectsSidebarLocked || isProjectsSidebarOpen ? 'right-[23rem]' : 'right-16'
    : isProjectsSidebarLocked || isProjectsSidebarOpen ? 'right-[33rem]' : 'right-52';

  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 ${rightPosition} hidden md:flex w-14 h-14 bg-yellow-400 hover:bg-yellow-500 
        text-black rounded-full shadow-[0_4px_20px_rgba(249,215,28,0.4)] hover:shadow-[0_6px_25px_rgba(249,215,28,0.6)]
        items-center justify-center transition-all duration-200 z-[9998] active:scale-95 group
        ${isOpen ? 'rotate-45' : 'hover:scale-105'}`}
    >
      <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
    </button>
  );
}; 