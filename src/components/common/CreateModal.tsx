import React from 'react';

interface CreateDropdownProps {
  onCreateLineItem: () => void;
  onCreateClient: () => void;
  onCreateProject: () => void;
  onCreateInvoice: () => void;
  onCreateProduct: () => void;
  onCreatePackage?: () => void; // Optional as part of simplification
  onCreatePriceBookTemplate: () => void;
  onCreateProjectTemplate: () => void;
  onCreateContractTemplate: () => void;
  // onCreateCategory is not used in the component
}

export const CreateDropdown: React.FC<CreateDropdownProps> = ({
  onCreateLineItem,
  onCreateClient,
  onCreateProject,
  onCreateInvoice,
  onCreateProduct,
  onCreatePackage,
  onCreatePriceBookTemplate,
  onCreateProjectTemplate,
  onCreateContractTemplate
}) => {
  return (
    <div className="w-[240px] bg-[#121212] rounded-md p-2 flex flex-col max-h-[80vh] overflow-y-auto shadow-lg">
      {/* Section: Line Item */}
      <div className="mb-2">
        <button 
          onClick={onCreateLineItem} 
          className="flex items-center gap-2 px-3 py-2 text-gray-300 text-xs font-medium text-left hover:bg-[#1E1E1E] hover:border-l-2 hover:border-[#336699] rounded-md transition-colors w-full"
        >
          <span className="text-lg text-[#336699]">+</span>
          Line Item
        </button>
      </div>

      {/* Section: Main Items */}
      <div className="mb-2 border-t border-gray-700 pt-2">
        <h3 className="text-gray-400 text-xs uppercase font-medium mb-1 px-3">CREATE</h3>
        <div className="grid grid-cols-1 gap-1">
          <button 
            onClick={onCreateClient} 
            className="flex items-center gap-2 px-3 py-2 text-gray-300 text-xs font-medium text-left hover:bg-[#1E1E1E] hover:border-l-2 hover:border-[#336699] rounded-md transition-colors w-full"
          >
            <span className="text-lg text-[#336699]">👤</span>
            Client
          </button>
          <button 
            onClick={onCreateProject} 
            className="flex items-center gap-2 px-3 py-2 text-gray-300 text-xs font-medium text-left hover:bg-[#1E1E1E] hover:border-l-2 hover:border-[#336699] rounded-md transition-colors w-full"
          >
            <span className="text-lg text-[#336699]">📁</span>
            Project
          </button>
          <button 
            onClick={onCreateInvoice} 
            className="flex items-center gap-2 px-3 py-2 text-gray-300 text-xs font-medium text-left hover:bg-[#1E1E1E] hover:border-l-2 hover:border-[#336699] rounded-md transition-colors w-full"
          >
            <span className="text-lg text-[#336699]">📄</span>
            Invoice
          </button>
          {onCreatePackage && (
            <button 
              onClick={onCreatePackage} 
              className="flex items-center gap-2 px-3 py-2 text-gray-300 text-xs font-medium text-left hover:bg-[#1E1E1E] hover:border-l-2 hover:border-[#336699] rounded-md transition-colors w-full"
            >
              <span className="text-lg text-[#336699]">📦</span>
              Package
            </button>
          )}
          <button 
            onClick={onCreateProduct} 
            className="flex items-center gap-2 px-3 py-2 text-gray-300 text-xs font-medium text-left hover:bg-[#1E1E1E] hover:border-l-2 hover:border-[#336699] rounded-md transition-colors w-full"
          >
            <span className="text-lg text-[#336699]">📦</span>
            Product
          </button>
        </div>
      </div>

      {/* Section: Templates */}
      <div className="border-t border-gray-700 pt-2">
        <h3 className="text-gray-400 text-xs uppercase font-medium mb-1 px-3">TEMPLATES</h3>
        <div className="grid grid-cols-1 gap-1">
          <button 
            onClick={onCreatePriceBookTemplate} 
            className="flex items-center gap-2 px-3 py-2 text-gray-300 text-xs font-medium text-left hover:bg-[#1E1E1E] hover:border-l-2 hover:border-[#336699] rounded-md transition-colors w-full"
          >
            <span className="text-lg text-[#336699]">📘</span>
            Price book template
          </button>
          <button 
            onClick={onCreateProjectTemplate} 
            className="flex items-center gap-2 px-3 py-2 text-gray-300 text-xs font-medium text-left hover:bg-[#1E1E1E] hover:border-l-2 hover:border-[#336699] rounded-md transition-colors w-full"
          >
            <span className="text-lg text-[#336699]">📁</span>
            Project template
          </button>
          <button 
            onClick={onCreateContractTemplate} 
            className="flex items-center gap-2 px-3 py-2 text-gray-300 text-xs font-medium text-left hover:bg-[#1E1E1E] hover:border-l-2 hover:border-[#336699] rounded-md transition-colors w-full"
          >
            <span className="text-lg text-[#336699]">📄</span>
            Contract template
          </button>
        </div>
      </div>
    </div>
  );
};
