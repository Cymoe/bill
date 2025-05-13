import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Dropdown } from '../common/Dropdown';
import { NewProductModal } from './NewProductModal';
import { EditProductModal } from './EditProductModal';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { PRODUCT_TYPE_OPTIONS } from '../../constants';
import TableHeader from './TableHeader';

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  user_id: string;
  created_at: string;
  type: string;
};

export const ProductList: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const [activeType, setActiveType] = useState<string>('all');

  const typeTabs = [
    { value: 'all', label: 'All' },
    ...PRODUCT_TYPE_OPTIONS
  ];

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const filteredProducts = products.filter((product) =>
    (activeType === 'all' || product.type === activeType) &&
    (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setDeletingProduct(null);
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const getTypeLabel = (type: string) => PRODUCT_TYPE_OPTIONS.find(opt => opt.value === type)?.label || type;

  // TableView for line items
  const TableView: React.FC<{ products: Product[] }> = ({ products }) => (
    <div className="overflow-x-auto w-full">
      <table className="w-full table-fixed divide-y divide-gray-200 dark:divide-gray-700">
        <TableHeader />
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
          {products.map((product) => (
            <tr key={product.id}>
              <td className="pl-8 pr-4 py-3 w-[25%] whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">{product.name}</td>
              <td className="pl-8 pr-4 py-3 w-[35%] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate border border-gray-200 dark:border-gray-700">{product.description}</td>
              <td className="pl-8 pr-4 py-3 w-[12%] whitespace-nowrap text-sm text-indigo-600 dark:text-indigo-400 border border-gray-200 dark:border-gray-700 text-right">{formatCurrency(product.price)}</td>
              <td className="px-4 py-3 w-[10%] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 text-left">{product.unit}</td>
              <td className="px-4 py-3 w-[12%] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 text-center">{getTypeLabel(product.type)}</td>
              <td className="p-1 w-[5%] whitespace-nowrap border border-gray-200 dark:border-gray-700 text-center">
                <Dropdown
                  trigger={
                    <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  }
                  items={[
                    {
                      label: 'Edit',
                      onClick: () => setEditingProduct(product)
                    },
                    {
                      label: 'Delete',
                      onClick: () => setDeletingProduct(product),
                      className: 'text-red-600 hover:text-red-700'
                    }
                  ]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {products.length === 0 && (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">No line items found.</div>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="px-8 pt-8">
          <Breadcrumbs items={[{ label: 'Price Book', href: '/price-book' }]} />
          <div className="flex gap-4 pb-2">
            {typeTabs.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveType(tab.value)}
                className={`relative px-1 pb-2 text-sm font-medium transition-colors focus:outline-none
                  ${activeType === tab.value ? 'text-indigo-400' : 'text-gray-400 hover:text-indigo-300'}`}
              >
                {tab.label}
                {activeType === tab.value && (
                  <span className="absolute left-0 right-0 -bottom-[2px] h-1 bg-indigo-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mt-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search price book..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNewModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 w-full md:w-auto"
              >
                <Plus className="w-5 h-5" />
                <span>New Line Item</span>
              </button>
            </div>
          </div>
        </div>
        <div>
          <TableView products={filteredProducts} />
        </div>
      </div>
      {showNewModal && (
        <NewProductModal
          onClose={() => setShowNewModal(false)}
          onSave={async () => {
            setShowNewModal(false);
            await fetchProducts();
          }}
        />
      )}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={async () => {
            setEditingProduct(null);
            await fetchProducts();
          }}
        />
      )}
      {deletingProduct && (
        <DeleteConfirmationModal
          title="Delete Product"
          message="Are you sure you want to delete this product? This action cannot be undone."
          onConfirm={() => handleDelete(deletingProduct.id)}
          onCancel={() => setDeletingProduct(null)}
        />
      )}
    </DashboardLayout>
  );
};
