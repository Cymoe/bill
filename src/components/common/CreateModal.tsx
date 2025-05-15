import React from 'react';
import { X, User, Calendar, FileText, Package, Grid, FileSpreadsheet, FileBox, Plus } from 'lucide-react';

interface CreateModalProps {
  onClose: () => void;
  onCreateLineItem: () => void;
  onCreateCategory: () => void;
  onCreateClient: () => void;
  onCreateProject: () => void;
  onCreateInvoice: () => void;
  onCreateProduct: () => void;
}

export const CreateModal: React.FC<CreateModalProps> = ({
  onClose,
  onCreateLineItem,
  onCreateCategory,
  onCreateClient,
  onCreateProject,
  onCreateInvoice,
  onCreateProduct
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-[#1A1F2C] p-6 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-white">Create New</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* CREATE IN OTHER AREAS */}
        <div className="mb-8">
          <h3 className="text-sm text-gray-400 font-medium mb-4">CREATE IN OTHER AREAS</h3>
          <div className="grid grid-cols-4 gap-4">
            <button onClick={onCreateClient} className="flex flex-col items-center gap-2">
              <div className="rounded-2xl bg-[#232632] p-4 aspect-square flex items-center justify-center">
                <User className="h-6 w-6 text-gray-400" />
              </div>
              <span className="text-sm text-white">Client</span>
            </button>
            <button onClick={onCreateProject} className="flex flex-col items-center gap-2">
              <div className="rounded-2xl bg-[#232632] p-4 aspect-square flex items-center justify-center">
                <Calendar className="h-6 w-6 text-gray-400" />
              </div>
              <span className="text-sm text-white">Project</span>
            </button>
            <button onClick={onCreateInvoice} className="flex flex-col items-center gap-2">
              <div className="rounded-2xl bg-[#232632] p-4 aspect-square flex items-center justify-center">
                <FileText className="h-6 w-6 text-gray-400" />
              </div>
              <span className="text-sm text-white">Invoice</span>
            </button>
            <button onClick={onCreateProduct} className="flex flex-col items-center gap-2">
              <div className="rounded-2xl bg-[#232632] p-4 aspect-square flex items-center justify-center">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
              <span className="text-sm text-white">Product</span>
            </button>
          </div>
        </div>

        {/* TEMPLATES & PRESETS */}
        <div className="mb-8">
          <h3 className="text-sm text-gray-400 font-medium mb-4">TEMPLATES & PRESETS</h3>
          <div className="flex flex-col gap-2">
            <button className="flex items-center justify-between w-full rounded-2xl bg-[#232632] p-4 hover:bg-[#2A2E39]">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 text-gray-400" />
                <span className="text-white">Contract template</span>
              </div>
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button className="flex items-center justify-between w-full rounded-2xl bg-[#232632] p-4 hover:bg-[#2A2E39]">
              <div className="flex items-center gap-3">
                <Grid className="h-5 w-5 text-gray-400" />
                <span className="text-white">Price book template</span>
              </div>
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button className="flex items-center justify-between w-full rounded-2xl bg-[#232632] p-4 hover:bg-[#2A2E39]">
              <div className="flex items-center gap-3">
                <FileBox className="h-5 w-5 text-gray-400" />
                <span className="text-white">Project template</span>
              </div>
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* PRICE BOOK ITEMS */}
        <div>
          <h3 className="text-sm text-gray-400 font-medium mb-4">PRICE BOOK ITEMS</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={onCreateLineItem}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-blue-500 hover:bg-blue-600 p-6 aspect-square"
            >
              <Plus className="h-8 w-8 text-white" />
              <span className="text-white font-medium">Line Item</span>
              <span className="text-sm text-white/80">Add to price book</span>
            </button>
            <button
              onClick={onCreateCategory}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-[#232632] hover:bg-[#2A2E39] p-6 aspect-square"
            >
              <Grid className="h-8 w-8 text-gray-400" />
              <span className="text-white font-medium">Category</span>
              <span className="text-sm text-gray-400">Organize items</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
