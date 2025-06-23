import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";
import { formatCurrency } from '../../utils/format';

type Package = Doc<"templates">;

interface SelectPackageModalProps {
  onClose: () => void;
  onSelect: (template: Package) => void;
}

export const SelectPackageModal: React.FC<SelectPackageModalProps> = ({
  onClose,
  onSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const templates = useQuery(api.templates.getTemplates) || [];

  const filteredTemplates = templates.filter((template: Package) =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Select a Package</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="mt-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search packages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto p-6">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No packages found. Try a different search term.
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredTemplates.map((template) => (
                <div 
                  key={template._id}
                  onClick={() => onSelect(template)}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors"
                >
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{template.name}</h3>
                  {template.description && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{template.description}</p>
                  )}
                  <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    {template.items?.length} items · Total: {formatCurrency(
                      template.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
