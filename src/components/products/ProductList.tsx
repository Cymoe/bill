import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, Table as TableIcon, Grid as GridIcon, X } from 'lucide-react';
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
import { PRODUCT_TYPE_OPTIONS } from '../../constants';
import ProductAssemblyForm from './ProductAssemblyForm';

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
  const [isLoading, setIsLoading] = useState(true);
  const [activeType, setActiveType] = useState<string>('all');
  const [activeSection, setActiveSection] = useState<'line_items' | 'products'>('products');
  const [showNewAssemblyModal, setShowNewAssemblyModal] = useState(false);

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
    } finally {
      setIsLoading(false);
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
      fetchProducts(); // Refresh the list
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const getTypeLabel = (type: string) => PRODUCT_TYPE_OPTIONS.find(opt => opt.value === type)?.label || type;

  // TableView component
  const TableView: React.FC<{ products: Product[] }> = ({ products }) => (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unit</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created At</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
          {products.map((product) => (
            <tr key={product.id}>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{product.name}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">{product.description}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-indigo-600 dark:text-indigo-400">{formatCurrency(product.price)}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{product.unit}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{getTypeLabel(product.type)}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{product.created_at ? new Date(product.created_at).toLocaleDateString() : ''}</td>
              <td className="px-4 py-3 whitespace-nowrap">
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
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">No products found.</div>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <Breadcrumbs items={[{ label: 'Price Book', href: '/products' }]} />
        
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
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
            {activeSection === 'line_items' && (
              <button
                onClick={() => setShowNewModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 w-full md:w-auto"
              >
                <Plus className="w-5 h-5" />
                <span>New Line Item</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            className={`px-6 py-2 rounded-full text-base font-medium transition-colors focus:outline-none border
              ${activeSection === 'products' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-transparent text-gray-400 border-gray-600 hover:bg-gray-800'}`}
            onClick={() => setActiveSection('products')}
          >
            Products
          </button>
          <button
            className={`px-6 py-2 rounded-full text-base font-medium transition-colors focus:outline-none border
              ${activeSection === 'line_items' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-transparent text-gray-400 border-gray-600 hover:bg-gray-800'}`}
            onClick={() => setActiveSection('line_items')}
          >
            Line Items
          </button>
        </div>

        {activeSection === 'line_items' && (
          <>
            <div className="flex gap-4 mb-4 border-b border-gray-700">
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
            {/* Only show table view for line items */}
            <div className="hidden md:block">
              <TableView products={filteredProducts} />
            </div>
            {/* Mobile list */}
            <div className="md:hidden space-y-4">
              {isLoading ? (
                <>
                  <ProductCardSkeleton />
                  <ProductCardSkeleton />
                  <ProductCardSkeleton />
                </>
              ) : (
                <div className="space-y-4 pb-20">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
                    >
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            {product.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {product.description}
                          </p>
                          <div className="flex items-center mt-2">
                            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                              {formatCurrency(product.price)}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                              / {product.unit}
                            </span>
                          </div>
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
                              onClick: () => setEditingProduct(product)
                            },
                            {
                              label: 'Delete',
                              onClick: () => setDeletingProduct(product),
                              className: 'text-red-600 hover:text-red-700'
                            }
                          ]}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeSection === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Products / Assemblies</h2>
              <button
                onClick={() => setShowNewAssemblyModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Plus className="w-5 h-5" />
                <span>New Product</span>
              </button>
            </div>
            {products.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-20">No products/assemblies found.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
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
                          // TODO: backend integration for add/edit
                          await fetchProducts();
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
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

      {editingProduct && activeSection === 'line_items' && (
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
