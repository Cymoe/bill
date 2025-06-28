import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface SlideOutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl';
}

export const SlideOutDrawer: React.FC<SlideOutDrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  width = 'md'
}) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[11000] flex justify-end">
      {/* Backdrop with blur and darker opacity */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Drawer */}
      <div className={`relative w-full ${widthClasses[width]} bg-[#1A1A1A] h-full shadow-2xl border-l border-[#333333] transform transition-transform duration-300 ${
        isClosing ? 'translate-x-full' : 'translate-x-0'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#333333]">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-[#333333] rounded-[4px] transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-73px)]">
          {children}
        </div>
      </div>
    </div>
  );
}; 