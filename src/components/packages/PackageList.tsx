import React, { useState, useEffect } from 'react';
import { MoreVertical, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/database';
import type { Tables } from '../../lib/database';
import { formatCurrency } from '../../utils/format';
import { Dropdown } from '../common/Dropdown';
import { NewPackageModal } from '../modals/NewPackageModal';
import { EditPackageModal } from '../modals/EditPackageModal';
import { DeleteConfirmationModal } from '../modals/DeleteConfirmationModal';
import { TemplateCardSkeleton } from '../skeletons/TemplateCardSkeleton';

type Package = Tables['invoice_templates'] & {
  description?: string;
  total_amount?: number;
  type?: string;
  status?: string;
  items: Array<{
    id: string;
    template_id: string;
    product_id: string;
    quantity: number;
    price: number;
    created_at?: string;
  }>;
};

interface PackageListProps {
  searchTerm?: string;
  packageType?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
}

export const PackageList: React.FC<PackageListProps> = ({ 
  searchTerm = '', 
  packageType,
  minPrice,
  maxPrice,
  status
}) => {
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Package | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<Package | null>(null);
  // We only need grid view for packages

  const { user } = useAuth();
  const [templates, setTemplates] = useState<Package[]>([]);
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

  const filteredTemplates = templates.filter((template) => {
    // Search term filter
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Type filter
    const matchesType = !packageType || template.type === packageType;
    
    // Price range filter
    const totalPrice = template.items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const matchesMinPrice = minPrice === undefined || totalPrice >= minPrice;
    const matchesMaxPrice = maxPrice === undefined || totalPrice <= maxPrice;
    
    // Status filter (assuming we have a status field, if not we can add it later)
    const matchesStatus = !status || status === 'all' || template.status === status;
    
    return matchesSearch && matchesType && matchesMinPrice && matchesMaxPrice && matchesStatus;
  });

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
        No Packages Yet
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
        Packages help you save time by pre-configuring common invoice items. Perfect for recurring services or standard project packages. Create a package once and reuse it for multiple invoices!
      </p>
      <p className="text-sm text-indigo-500 dark:text-indigo-400">
        Click the "New Package" button above to get started.
      </p>
    </div>
  );

  return (
    <div className="space-y-0">
      {/* Top spacing */}
      <div className="h-4"></div>

      {/* Desktop view */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
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
                      onClick: () => setEditingTemplate({ ...template, items: template.items || [] }),
                    },
                    {
                      label: 'Delete',
                      onClick: () => setDeletingTemplate(template),
                      className: 'text-red-600 hover:text-red-700',
                    },
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

      <div className="md:hidden space-y-4 px-4">
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
                      onClick: () => setEditingTemplate({ ...template, items: template.items || [] }),
                    },
                    {
                      label: 'Delete',
                      onClick: () => setDeletingTemplate(template),
                      className: 'text-red-600 hover:text-red-700',
                    },
                  ]}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {showNewModal && (
        <NewPackageModal
          onClose={() => setShowNewModal(false)}
          onSave={fetchTemplates}
        />
      )}

      {editingTemplate && (
        <EditPackageModal
          onClose={() => setEditingTemplate(null)}
          onSave={fetchTemplates}
          template={editingTemplate as Package}
        />
      )}

      {deletingTemplate && (
        <DeleteConfirmationModal
          onCancel={() => setDeletingTemplate(null)}
          onConfirm={() => handleDelete(deletingTemplate.id)}
          title="Delete Package"
          message={`Are you sure you want to delete the package "${deletingTemplate.name}"? This action cannot be undone.`}
        />
      )}
    </div>
  );
};
