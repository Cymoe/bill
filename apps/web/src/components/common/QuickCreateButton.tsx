import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClick: () => void;
  isSidebarCollapsed?: boolean;
  isProjectsSidebarLocked?: boolean;
  isProjectsSidebarOpen?: boolean;
  isIndustryDrawerOpen?: boolean;
}

export const QuickCreateButton: React.FC<Props> = ({ 
  isOpen, 
  onClick,
  isSidebarCollapsed = false,
  isProjectsSidebarLocked = false,
  isProjectsSidebarOpen = false,
  isIndustryDrawerOpen = false
}) => {
  const [isEstimateCartOpen, setIsEstimateCartOpen] = useState(false);
  const [isIndustryModalOpen, setIsIndustryModalOpen] = useState(false);
  
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

  // Listen for estimate cart toggle events
  useEffect(() => {
    const handleCartToggle = (event: CustomEvent) => {
      setIsEstimateCartOpen(event.detail.isOpen);
    };

    window.addEventListener('estimateCartToggle', handleCartToggle as EventListener);
    return () => {
      window.removeEventListener('estimateCartToggle', handleCartToggle as EventListener);
    };
  }, []);

  // Listen for industry modal toggle events
  useEffect(() => {
    const handleModalToggle = (event: CustomEvent) => {
      setIsIndustryModalOpen(event.detail.isOpen);
    };

    window.addEventListener('industryModalToggle', handleModalToggle as EventListener);
    return () => {
      window.removeEventListener('industryModalToggle', handleModalToggle as EventListener);
    };
  }, []);

  // Hide button when estimate cart or industry modal is open
  if (isEstimateCartOpen || isIndustryModalOpen) {
    return null;
  }

  // Dynamic positioning based on sidebar states
  let baseRight = isSidebarCollapsed ? 96 : 240; // 24 * 4 or 60 * 4 (in pixels)
  let projectsOffset = (isProjectsSidebarLocked || isProjectsSidebarOpen) ? 320 : 0;
  let industryOffset = isIndustryDrawerOpen ? 400 : 0;
  
  let totalRightPx = baseRight + projectsOffset + industryOffset;

  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 hidden md:flex w-14 h-14 bg-yellow-400 hover:bg-yellow-500 
        text-black rounded-full shadow-[0_4px_20px_rgba(249,215,28,0.4)] hover:shadow-[0_6px_25px_rgba(249,215,28,0.6)]
        items-center justify-center transition-all duration-200 z-[9998] active:scale-95 group
        ${isOpen ? 'rotate-45' : 'hover:scale-105'}`}
      style={{ right: `${totalRightPx}px` }}
    >
      <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
    </button>
  );
}; 