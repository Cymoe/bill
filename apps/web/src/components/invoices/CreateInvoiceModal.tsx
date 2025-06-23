import React, { useState } from 'react';
import { X, FileText, Package, ArrowRight } from 'lucide-react';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (option: 'scratch' | 'template') => void;
}

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  isOpen,
  onClose,
  onSelectOption
}) => {
  const [hoveredOption, setHoveredOption] = useState<'scratch' | 'template' | null>(null);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with blur effect */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity z-[9998]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
        <div className="bg-[#1E1E1E] border border-[#333333] rounded-[4px] w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#333333]">
            <h2 className="text-xl font-semibold text-white">Create New Invoice</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-400 mb-6">
              Choose how you'd like to create your invoice:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {/* From Scratch Option */}
              <button
                onClick={() => onSelectOption('scratch')}
                onMouseEnter={() => setHoveredOption('scratch')}
                onMouseLeave={() => setHoveredOption(null)}
                className={`
                  relative p-6 bg-[#333333] border-2 rounded-[4px] text-left transition-all
                  ${hoveredOption === 'scratch' 
                    ? 'border-[#336699] bg-[#333333]/80' 
                    : 'border-[#333333] hover:border-[#555555]'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  <div className={`
                    w-12 h-12 rounded-[4px] flex items-center justify-center transition-colors
                    ${hoveredOption === 'scratch' ? 'bg-[#336699]' : 'bg-[#1E1E1E]'}
                  `}>
                    <FileText className={`w-6 h-6 ${hoveredOption === 'scratch' ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-2">Start from Scratch</h3>
                    <p className="text-gray-400 text-sm">
                      Create a blank invoice and add line items manually. Perfect for one-off projects or custom work.
                    </p>
                  </div>
                  <ArrowRight className={`
                    w-5 h-5 mt-1 transition-all
                    ${hoveredOption === 'scratch' 
                      ? 'text-[#336699] translate-x-1' 
                      : 'text-gray-500'
                    }
                  `} />
                </div>
              </button>

              {/* From Template Option */}
              <button
                onClick={() => onSelectOption('template')}
                onMouseEnter={() => setHoveredOption('template')}
                onMouseLeave={() => setHoveredOption(null)}
                className={`
                  relative p-6 bg-[#333333] border-2 rounded-[4px] text-left transition-all
                  ${hoveredOption === 'template' 
                    ? 'border-[#F9D71C] bg-[#333333]/80' 
                    : 'border-[#333333] hover:border-[#555555]'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  <div className={`
                    w-12 h-12 rounded-[4px] flex items-center justify-center transition-colors
                    ${hoveredOption === 'template' ? 'bg-[#F9D71C]' : 'bg-[#1E1E1E]'}
                  `}>
                    <Package className={`w-6 h-6 ${hoveredOption === 'template' ? 'text-[#121212]' : 'text-gray-400'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-2">Use a Template</h3>
                    <p className="text-gray-400 text-sm">
                      Start with a saved template or package. Great for recurring services or standard projects.
                    </p>
                  </div>
                  <ArrowRight className={`
                    w-5 h-5 mt-1 transition-all
                    ${hoveredOption === 'template' 
                      ? 'text-[#F9D71C] translate-x-1' 
                      : 'text-gray-500'
                    }
                  `} />
                </div>
              </button>
            </div>

            {/* Quick Tips */}
            <div className="mt-6 p-4 bg-[#252525] rounded-[4px] border border-[#333333]">
              <h4 className="text-sm font-medium text-gray-300 mb-2">💡 Quick Tips</h4>
              <ul className="space-y-1 text-xs text-gray-400">
                <li>• Templates save time for recurring services</li>
                <li>• You can save any invoice as a template for future use</li>
                <li>• Both options allow full customization before sending</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}; 