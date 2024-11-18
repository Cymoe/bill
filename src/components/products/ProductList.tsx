import React, { useState } from 'react';
import { Plus, Search, MoreVertical } from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { formatCurrency } from '../../utils/format';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Dropdown } from '../common/Dropdown';
import { NewProductModal } from './NewProductModal';
import { EditProductModal } from './EditProductModal';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';
import { ProductCardSkeleton } from '../skeletons/ProductCardSkeleton';

type Product = Doc<"products">;

export const ProductList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const products = useQuery(api.products.getProducts);
  const deleteProduct = useMutation(api.products.deleteProduct);

  const isLoading = !products;

  const filteredProducts = (products || []).filter((product: Product) => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: Id<"products">) => {
    try {
      await deleteProduct({ id });
      setDeletingProduct(null);
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <Breadcrumbs items={[{ label: 'Products', href: '/products' }]} />
        
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
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
            onClick={() => setShowNewModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 w-full md:w-auto"
          >
            <Plus className="w-5 h-5" />
            <span>New Product</span>
          </button>
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <>
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </>
          ) : (
            filteredProducts.map((product) => (
              <div 
                key={product._id}
                className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {product.unit}
                    </p>
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
                
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {product.description}
                </p>
                
                <div className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
                  {formatCurrency(product.price)}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    {' '}/ {product.unit}
                  </span>
                </div>
              </div>
            ))
          )}
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
                  key={product._id}
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
      </div>

      {showNewModal && (
        <NewProductModal
          onClose={() => setShowNewModal(false)}
          onSave={() => setShowNewModal(false)}
        />
      )}

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={() => setEditingProduct(null)}
        />
      )}

      {deletingProduct && (
        <DeleteConfirmationModal
          title="Delete Product"
          message="Are you sure you want to delete this product? This action cannot be undone."
          onConfirm={() => handleDelete(deletingProduct._id)}
          onCancel={() => setDeletingProduct(null)}
        />
      )}
    </DashboardLayout>
  );
};
