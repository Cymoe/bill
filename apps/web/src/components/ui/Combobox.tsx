import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/react-dom';
import { Check, ChevronDown, Search } from 'lucide-react';

interface ComboboxProps {
  options: {
    value: string;
    label: string;
  }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const Combobox: React.FC<ComboboxProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select option...'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const { x, y, refs, strategy, update } = useFloating({
    placement: 'bottom-start',
    middleware: [offset(4), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  const filteredOptions = query === ''
    ? options
    : options.filter((option) =>
        option.label
          .toLowerCase()
          .replace(/\s+/g, '')
          .includes(query.toLowerCase().replace(/\s+/g, ''))
      );

  const openDropdown = () => {
    setIsOpen(true);
    setTimeout(() => {
      update();
      refs.floating.current?.focus();
    }, 0);
  };

  return (
    <div className="relative">
      <div
        className="relative h-[28px] w-[200px] cursor-pointer"
        ref={refs.setReference}
        onClick={() => {
          if (!isOpen) openDropdown();
        }}
      >
        <input
          ref={refs.setReference}
          className="h-[28px] w-[250px] bg-white/8 rounded-full px-3 pr-8 text-sm text-white placeholder-white/48 border-none focus:outline-none focus:ring-2 focus:ring-accent hover:bg-white/16 transition-colors cursor-pointer"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={options.find(o => o.value === value)?.label || placeholder}
          readOnly
          onFocus={openDropdown}
        />
        <ChevronDown 
          className={`absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white transition-all ${isOpen ? 'rotate-180 opacity-100' : 'opacity-48'}`}
        />
      </div>

      {isOpen && typeof window !== 'undefined' && createPortal(
        <div
          ref={refs.setFloating}
          className="z-[9999] rounded-xl shadow-lg max-h-[300px] overflow-auto border border-white/8"
          style={{
            position: strategy,
            left: x ?? 0,
            top: y ?? 0,
            background: '#23272f',
            color: '#fff',
            minWidth: (refs.reference.current as HTMLElement | null)?.offsetWidth || 250,
          }}
        >
          <div className="sticky top-0 p-1 border-b border-white/8" style={{ background: '#23272f' }}>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white opacity-48" />
              <input
                className="w-full h-8 bg-[#23272f] rounded-lg pl-8 pr-3 text-sm text-white placeholder-white/48 border-none focus:outline-none focus:ring-2 focus:ring-accent hover:bg-white/16 transition-colors"
                spellCheck={false}
                autoFocus
                placeholder="Search templates..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ background: '#23272f' }}
              />
            </div>
          </div>
          <div className="py-1">
            {filteredOptions.map((option) => (
              <div
                key={option.value}
                className={`flex items-center px-3 py-2 text-sm cursor-pointer rounded-lg ${
                  option.value === value
                    ? 'bg-accent/16 text-white'
                    : 'text-white/64 hover:bg-white/8'
                }`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                  setQuery('');
                }}
                style={{ background: '#23272f' }}
              >
                <span className="flex-1">{option.label}</span>
                {option.value === value && (
                  <Check className="w-4 h-4 text-accent" />
                )}
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
