import React, { useState, useRef, useEffect } from 'react';

interface DropdownItem {
  label: React.ReactNode;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
}

export const Dropdown: React.FC<DropdownProps> = ({ trigger, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50"
        >
          <div className="py-1" role="menu" aria-orientation="vertical">
            {items.map((item, index) => (
              typeof item.label === 'string' && item.label === '' ? (
                <div
                  key={index}
                  className={item.className || ''}
                  style={{ height: '1px', background: '#35384A', margin: '4px 0' }}
                  aria-hidden="true"
                />
              ) : (
                <button
                  key={index}
                  onClick={(e) => {
                    item.onClick(e);
                    setIsOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    item.className ||
                    'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  role="menuitem"
                >
                  {item.label}
                </button>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
};