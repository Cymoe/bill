import React, { useState, useEffect } from 'react';
import { Plus, MoreVertical, X, Search } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Dropdown } from '../common/Dropdown';
import { NewProductModal } from './NewProductModal';
import { EditProductModal } from './EditProductModal';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';
import { ProductCardSkeleton } from '../skeletons/ProductCardSkeleton';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import ProductAssemblyForm from './ProductAssemblyForm';

// Product type
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

export const ProductsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewAssemblyModal, setShowNewAssemblyModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
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

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="px-8 pt-8">
          <Breadcrumbs items={[{ label: 'Products', href: '/products' }]} />
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mt-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <button
              onClick={() => setShowNewAssemblyModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-5 h-5" />
              <span>New Product</span>
            </button>
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Products / Assemblies</h2>
          </div>
          {isLoading ? (
            <>
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </>
          ) : products.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-20">No products/assemblies found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 relative">
                  <div className="absolute top-2 right-2">
                    <Dropdown
                      trigger={
                        <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      }
                      items={[
                        {
                          label: 'Edit',
                          onClick: () => {
                            setEditingProduct(product);
                            setShowNewAssemblyModal(true);
                          }
                        },
                        {
                          label: 'Delete',
                          onClick: () => setDeletingProduct(product),
                          className: 'text-red-600 hover:text-red-700'
                        }
                      ]}
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{product.description}</p>
                  <div className="text-indigo-600 dark:text-indigo-400 font-semibold text-xl">{formatCurrency(product.price)}</div>
                </div>
              ))}
            </div>
          )}
          {/* New Product/Assembly Modal */}
          {showNewAssemblyModal && (
            <div className="fixed inset-0 z-[60] flex md:justify-end">
              <div 
                className={`absolute inset-0 bg-black transition-opacity duration-300 opacity-50`} 
                onClick={() => { setShowNewAssemblyModal(false); setEditingProduct(null); }}
              />
              <div 
                className={`fixed md:w-[50vw] transition-transform duration-300 ease-out bg-white dark:bg-gray-800 shadow-xl overflow-hidden md:right-0 md:top-0 md:bottom-0 bottom-0 left-0 right-0 h-full md:h-auto transform translate-y-0 md:translate-x-0`}
              >
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{editingProduct ? 'Edit Product / Assembly' : 'New Product / Assembly'}</h2>
                    <button onClick={() => { setShowNewAssemblyModal(false); setEditingProduct(null); }} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    <ProductAssemblyForm
                      editingProduct={editingProduct}
                      lineItems={products.filter(p => p.type !== 'assembly').map(p => ({ id: p.id, name: p.name, unit: p.unit, price: p.price }))}
                      onClose={() => { setShowNewAssemblyModal(false); setEditingProduct(null); }}
                      onSave={async (data) => {
                        setShowNewAssemblyModal(false);
                        setEditingProduct(null);
                        await fetchProducts();
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Modals */}
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