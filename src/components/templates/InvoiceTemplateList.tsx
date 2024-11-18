import React, { useState } from 'react';
import { Plus, Search, MoreVertical, FileText } from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { formatCurrency } from '../../utils/format';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Dropdown } from '../common/Dropdown';
import { NewTemplateModal } from './NewTemplateModal';
import { EditTemplateModal } from './EditTemplateModal';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';
import { TemplateCardSkeleton } from '../skeletons/TemplateCardSkeleton';

type Template = Doc<"templates">;

export const InvoiceTemplateList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<Template | null>(null);

  const templates = useQuery(api.templates.getTemplates);
  const deleteTemplate = useMutation(api.templates.deleteTemplate);

  const isLoading = !templates;

  const filteredTemplates = (templates || []).filter((template: Template) => 
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: Id<"templates">) => {
    try {
      await deleteTemplate({ id });
      setDeletingTemplate(null);
    } catch (err) {
      console.error('Error deleting template:', err);
    }
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
      <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
        <FileText className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Create Your First Template
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
        Templates help you save time by pre-configuring common invoice items. Perfect for recurring services or standard project packages. Create a template once and reuse it for multiple invoices!
      </p>
      <button
        onClick={() => setShowNewModal(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
      >
        <Plus className="w-4 h-4" />
        Create Template
      </button>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <Breadcrumbs items={[{ label: 'Templates', href: '/templates' }]} />
        
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 w-full md:w-auto"
          >
            <Plus className="w-5 h-5" />
            <span>New Template</span>
          </button>
        </div>

        {/* Desktop view */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <>
              <TemplateCardSkeleton />
              <TemplateCardSkeleton />
              <TemplateCardSkeleton />
              <TemplateCardSkeleton />
              <TemplateCardSkeleton />
              <TemplateCardSkeleton />
            </>
          ) : filteredTemplates.length === 0 && !searchTerm ? (
            <div className="col-span-full">
              <EmptyState />
            </div>
          ) : (
            filteredTemplates.map((template) => (
              <div 
                key={template._id}
                className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      {template.name}
                    </h3>
                  </div>
                  <Dropdown
                    trigger={
                      <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    }
                    items={[
                      {
                        label: 'Edit',
                        onClick: () => setEditingTemplate(template)
                      },
                      {
                        label: 'Delete',
                        onClick: () => setDeletingTemplate(template),
                        className: 'text-red-600 hover:text-red-700'
                      }
                    ]}
                  />
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {template.description}
                </p>
                
                <div className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
                  {formatCurrency(template.total_amount)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Mobile view */}
        <div className="md:hidden space-y-4">
          {isLoading ? (
            <>
              <TemplateCardSkeleton />
              <TemplateCardSkeleton />
              <TemplateCardSkeleton />
            </>
          ) : filteredTemplates.length === 0 && !searchTerm ? (
            <EmptyState />
          ) : (
            filteredTemplates.map((template) => (
              <div
                key={template._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {template.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {template.description}
                    </p>
                    <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mt-2 block">
                      {formatCurrency(template.total_amount)}
                    </span>
                  </div>
                  <Dropdown
                    trigger={
                      <button className="ml-4 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    }
                    items={[
                      {
                        label: 'Edit',
                        onClick: () => setEditingTemplate(template)
                      },
                      {
                        label: 'Delete',
                        onClick: () => setDeletingTemplate(template),
                        className: 'text-red-600 hover:text-red-700'
                      }
                    ]}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showNewModal && (
        <NewTemplateModal
          onClose={() => setShowNewModal(false)}
          onSave={() => setShowNewModal(false)}
        />
      )}

      {editingTemplate && (
        <EditTemplateModal
          template={editingTemplate}
          onClose={() => setEditingTemplate(null)}
          onSave={() => setEditingTemplate(null)}
        />
      )}

      {deletingTemplate && (
        <DeleteConfirmationModal
          title="Delete Template"
          message="Are you sure you want to delete this template? This action cannot be undone."
          onConfirm={() => handleDelete(deletingTemplate._id)}
          onCancel={() => setDeletingTemplate(null)}
        />
      )}
    </DashboardLayout>
  );
};