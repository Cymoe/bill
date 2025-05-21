import React from 'react';
import { User, Calendar, FileText, Package, FileBox, Plus } from 'lucide-react';

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
    <div className="w-[240px] bg-[#232632] rounded-lg p-2 flex flex-col max-h-[80vh] overflow-y-auto">
  
      <div className="mb-1">
        <button onClick={onCreateLineItem} className="flex items-center gap-2 px-3 py-1.5 text-[#A3A6AE] text-sm font-normal text-left hover:bg-[#282B34] rounded transition-colors w-full">
          <Plus className="w-3.5 h-3.5 text-[#336699]" />
          Line Item
        </button>
      </div>
      <div className="mb-1 border-t border-[#35373F] pt-1">
        <button onClick={onCreateClient} className="flex items-center gap-2 px-3 py-1.5 text-[#A3A6AE] text-sm font-normal text-left hover:bg-[#282B34] rounded transition-colors w-full">
          <User className="w-3.5 h-3.5 text-[#336699]" />
          Client
        </button>
        <button onClick={onCreateProject} className="flex items-center gap-2 px-3 py-1.5 text-[#A3A6AE] text-sm font-normal text-left hover:bg-[#282B34] rounded transition-colors w-full">
          <Calendar className="w-3.5 h-3.5 text-[#336699]" />
          Project
        </button>
        <button onClick={onCreateInvoice} className="flex items-center gap-2 px-3 py-1.5 text-[#A3A6AE] text-sm font-normal text-left hover:bg-[#282B34] rounded transition-colors w-full">
          <FileText className="w-3.5 h-3.5 text-[#336699]" />
          Invoice
        </button>
        {onCreatePackage && (
          <button onClick={onCreatePackage} className="flex items-center gap-2 px-3 py-1.5 text-[#A3A6AE] text-sm font-normal text-left hover:bg-[#282B34] rounded transition-colors w-full">
            <FileBox className="w-3.5 h-3.5 text-[#336699]" />
            Package
          </button>
        )}
        <button onClick={onCreateProduct} className="flex items-center gap-2 px-3 py-1.5 text-[#A3A6AE] text-sm font-normal text-left hover:bg-[#282B34] rounded transition-colors w-full">
          <Package className="w-3.5 h-3.5 text-[#336699]" />
          Product
        </button>
      </div>
      <div className="border-t border-[#35373F] pt-1">
        <button onClick={onCreatePriceBookTemplate} className="flex items-center gap-2 px-3 py-1.5 text-[#A3A6AE] text-sm font-normal text-left hover:bg-[#282B34] rounded transition-colors w-full">
          <FileText className="w-3.5 h-3.5 text-[#336699]" />
          Price book template
        </button>
        <button onClick={onCreateProjectTemplate} className="flex items-center gap-2 px-3 py-1.5 text-[#A3A6AE] text-sm font-normal text-left hover:bg-[#282B34] rounded transition-colors w-full">
          <FileText className="w-3.5 h-3.5 text-[#336699]" />
          Project template
        </button>
        <button onClick={onCreateContractTemplate} className="flex items-center gap-2 px-3 py-1.5 text-[#A3A6AE] text-sm font-normal text-left hover:bg-[#282B34] rounded transition-colors w-full">
          <FileText className="w-3.5 h-3.5 text-[#336699]" />
          Contract template
        </button>
      </div>
    </div>
  );
};
