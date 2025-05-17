import React from 'react';
import { User, Calendar, FileText, Package, Grid, FileSpreadsheet, FileBox, Plus } from 'lucide-react';

interface CreateDropdownProps {
  onCreateLineItem: () => void;
  onCreateCategory: () => void;
  onCreateClient: () => void;
  onCreateProject: () => void;
  onCreateInvoice: () => void;
  onCreateProduct: () => void;
  onCreatePackage: () => void;
  onCreatePriceBookTemplate: () => void;
  onCreateProjectTemplate: () => void;
  onCreateContractTemplate: () => void;
}

export const CreateDropdown: React.FC<CreateDropdownProps> = ({
  onCreateLineItem,
  onCreateCategory,
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
    <div className="absolute right-0 mt-2 w-[220px] bg-[#232632] rounded-lg z-50 p-2.5 flex flex-col min-w-[180px] shadow-lg">
      <div className="mb-2">
        <button onClick={onCreateLineItem} className="flex items-center gap-2 px-3 py-2 text-[#A3A6AE] text-sm font-normal text-left hover:bg-[#282B34] rounded-lg transition-colors w-full">
          <Plus className="w-4 h-4 text-[#A3A6AE]" />
          Line Item
        </button>
        <button onClick={onCreateCategory} className="flex items-center gap-2 px-3 py-2 text-[#A3A6AE] text-sm font-normal text-left hover:bg-[#282B34] rounded-lg transition-colors w-full">
          <Grid className="w-4 h-4 text-[#A3A6AE]" />
          Category
        </button>
      </div>
      <div className="mb-2 border-t border-[#35373F] pt-2">
        <button onClick={onCreateClient} className="flex items-center gap-2 px-3 py-2 text-[#A3A6AE] text-sm font-normal text-left hover:bg-[#282B34] rounded-lg transition-colors w-full">
          <User className="w-4 h-4 text-[#A3A6AE]" />
          Client
        </button>
        <button onClick={onCreateProject} className="flex items-center gap-2 px-3 py-2 text-[#A3A6AE] text-sm font-normal text-left hover:bg-[#282B34] rounded-lg transition-colors w-full">
          <Calendar className="w-4 h-4 text-[#A3A6AE]" />
          Project
        </button>
        <button onClick={onCreateInvoice} className="flex items-center gap-2 px-3 py-2 text-[#A3A6AE] text-sm font-normal text-left hover:bg-[#282B34] rounded-lg transition-colors w-full">
          <FileText className="w-4 h-4 text-[#A3A6AE]" />
          Invoice
        </button>
        <button onClick={onCreateProduct} className="flex items-center gap-2 px-3 py-2 text-[#A3A6AE] text-sm font-normal text-left hover:bg-[#282B34] rounded-lg transition-colors w-full">
          <Package className="w-4 h-4 text-[#A3A6AE]" />
          Product
        </button>
        <button onClick={onCreatePackage} className="flex items-center gap-2 px-3 py-2 text-[#A3A6AE] text-sm font-normal text-left hover:bg-[#282B34] rounded-lg transition-colors w-full">
          <FileBox className="w-4 h-4 text-[#A3A6AE]" />
          Package
        </button>
      </div>
      <div className="border-t border-[#35373F] pt-2">
        <button onClick={onCreatePriceBookTemplate} className="flex items-center gap-2 px-3 py-2 text-[#A3A6AE] text-sm font-normal text-left hover:bg-[#282B34] rounded-lg transition-colors w-full">
          <FileText className="w-4 h-4 text-[#A3A6AE]" />
          Price book template
        </button>
        <button onClick={onCreateProjectTemplate} className="flex items-center gap-2 px-3 py-2 text-[#A3A6AE] text-sm font-normal text-left hover:bg-[#282B34] rounded-lg transition-colors w-full">
          <FileText className="w-4 h-4 text-[#A3A6AE]" />
          Project template
        </button>
        <button onClick={onCreateContractTemplate} className="flex items-center gap-2 px-3 py-2 text-[#A3A6AE] text-sm font-normal text-left hover:bg-[#282B34] rounded-lg transition-colors w-full">
          <FileText className="w-4 h-4 text-[#A3A6AE]" />
          Contract template
        </button>
      </div>
    </div>
  );
};
