import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, FileText, Table as TableIcon, Grid as GridIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/database';
import type { Tables } from '../../lib/database';
import { formatCurrency } from '../../utils/format';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Dropdown } from '../common/Dropdown';
import { NewTemplateModal } from './NewTemplateModal';
import { EditTemplateModal } from './EditTemplateModal';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';
import { TemplateCardSkeleton } from '../skeletons/TemplateCardSkeleton';
import TableHeader from '../products/TableHeader';

type Template = Tables['invoice_templates'] & {
  description?: string;
  total_amount?: number;
  items: Array<{
    id: string;
    template_id: string;
    product_id: string;
    quantity: number;
    price: number;
    created_at?: string;
  }>;
};

export const InvoiceTemplateList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<Template | null>(null);
  const [view, setView] = useState<'grid' | 'table'>('grid');

  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTemplates();
    }
  }, [user]);

  const fetchTemplates = async () => {
    if (!user) return;
    try {
      const data = await db.invoice_templates.list(user.id);
      // Sort newest first
      data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setTemplates(data);
    } catch (err) {
      console.error('Error fetching templates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTemplates = (templates || []).filter((template: Template) => 
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (template.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      await db.invoice_templates.delete(id);
      await fetchTemplates(); // Refresh the list
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

  // TableView component
  const TableView: React.FC<{ templates: Template[] }> = ({ templates }) => (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <table className="min-w-full table-fixed divide-y divide-gray-200 dark:divide-gray-700">
        <TableHeader />
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
          {templates.map((template) => (
            <tr key={template.id}>
              <td className="px-4 py-3 w-1/5 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{template.name}</td>
              <td className="px-4 py-3 w-2/5 whitespace-nowrap text-sm text-indigo-600 dark:text-indigo-400">{formatCurrency(template.items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0))}</td>
              <td className="px-4 py-3 w-1/6 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{template.items?.length ?? 0}</td>
              <td className="px-4 py-3 w-1/8 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{template.created_at ? new Date(template.created_at).toLocaleDateString() : ''}</td>
              <td className="px-4 py-3 w-1/12 whitespace-nowrap">
                <Dropdown
                  trigger={
                    <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  }
                  items={[
                    {
                      label: 'Edit',
                      onClick: () => setEditingTemplate({ ...template, items: template.items || [] })
                    },
                    {
                      label: 'Delete',
                      onClick: () => setDeletingTemplate(template),
                      className: 'text-red-600 hover:text-red-700'
                    }
                  ]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {templates.length === 0 && (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">No templates found.</div>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="px-8 pt-8">
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView(view === 'grid' ? 'table' : 'grid')}
                className="flex items-center gap-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {view === 'grid' ? <TableIcon className="w-4 h-4" /> : <GridIcon className="w-4 h-4" />}
                <span className="hidden md:inline">{view === 'grid' ? 'Table View' : 'Grid View'}</span>
              </button>
              <button
                onClick={() => setShowNewModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 w-full md:w-auto"
              >
                <Plus className="w-5 h-5" />
                <span>New Template</span>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop view */}
        {view === 'grid' ? (
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
                  key={template.id}
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
                          onClick: () => setEditingTemplate({ ...template, items: template.items || [] })
                        },
                        {
                          label: 'Delete',
                          onClick: () => setDeletingTemplate(templates.find(t => t.id === template.id) || null),
                          className: 'text-red-600 hover:text-red-700'
                        }
                      ]}
                    />
                  </div>
                  
                  <div className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(
                      template.items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0)
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="hidden md:block">
            <TableView templates={filteredTemplates} />
          </div>
        )}

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
                key={template.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {template.name}
                    </h3>
                    <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mt-2 block">
                      {formatCurrency(
                        template.items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0)
                      )}
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
                        onClick: () => setEditingTemplate({ ...template, items: template.items || [] })
                      },
                      {
                        label: 'Delete',
                        onClick: () => setDeletingTemplate(templates.find(t => t.id === template.id) || null),
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
          onSave={async () => {
            setShowNewModal(false);
            await fetchTemplates();
          }}
        />
      )}

      {editingTemplate && (
        <EditTemplateModal
          template={editingTemplate}
          onClose={() => setEditingTemplate(null)}
          onSave={() => {
            setEditingTemplate(null);
            fetchTemplates();
          }}
        />
      )}

      {deletingTemplate && (
        <DeleteConfirmationModal
          title="Delete Template"
          message="Are you sure you want to delete this template? This action cannot be undone."
          onConfirm={async () => {
            await handleDelete(deletingTemplate.id);
            fetchTemplates();
          }}
          onCancel={() => setDeletingTemplate(null)}
        />
      )}
    </DashboardLayout>
  );
};