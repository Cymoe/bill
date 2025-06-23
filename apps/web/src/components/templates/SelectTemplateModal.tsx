import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";
import { formatCurrency } from '../../utils/format';

type Template = Doc<"templates">;

interface SelectTemplateModalProps {
  onClose: () => void;
  onSelect: (template: Template) => void;
}

export const SelectTemplateModal: React.FC<SelectTemplateModalProps> = ({
  onClose,
  onSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const templates = useQuery(api.templates.getTemplates) || [];

  const filteredTemplates = templates.filter((template: Template) =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Select Template</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredTemplates.map((template) => (
              <button
                key={template._id}
                onClick={() => onSelect(template)}
                className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {template.description}
                </p>
                <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                  {formatCurrency(template.total_amount)}
                </p>
              </button>
            ))}

            {filteredTemplates.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No templates found
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};