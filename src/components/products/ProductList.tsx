import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, Plus } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

import { DashboardLayout } from '../layouts/DashboardLayout';
import { NewProductModal } from './NewProductModal';
import { EditProductModal } from './EditProductModal';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
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

  const [showNewModal, setShowNewModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeType, setActiveType] = useState<string>('all');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const createDropdownRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { value: 'all', label: 'All' },
    { value: 'material', label: 'Material' },
    { value: 'labor', label: 'Labor' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'service', label: 'Service' },
    { value: 'subcontractor', label: 'Subcontractor' }
  ];

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  // Close dropdown on click outside
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  // Close create dropdown on click outside
  useEffect(() => {
    if (!showCreateDropdown) return;
    function handleClick(e: MouseEvent) {
      if (createDropdownRef.current && !createDropdownRef.current.contains(e.target as Node)) {
        setShowCreateDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showCreateDropdown]);

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
    activeType === 'all' || product.type === activeType
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

  const TableView: React.FC<{ products: Product[] }> = ({ products }) => (
    <div className="overflow-x-auto w-full">
      <table className="w-full table-fixed">
        <TableHeader />
        <tbody className="bg-gray-900 divide-y divide-gray-800">
          {products.map((product) => (
            <tr
              key={product.id}
              className="hover:bg-[#232632] cursor-pointer transition-colors"
              onClick={() => setEditingProduct(product)}
            >
              <td className="pl-8 pr-4 py-4 w-[20%] whitespace-nowrap text-sm font-semibold text-white/80 align-middle" data-testid="product-name">{product.name}</td>
              <td className="pl-8 pr-4 py-4 w-[55%] whitespace-nowrap text-base text-gray-300 align-middle">{product.description}</td>
              <td className="py-4 pr-3 whitespace-nowrap text-base text-white/80 align-middle text-right">{formatCurrency(product.price)}</td>
              <td className="py-4 pl-2 w-[120px] whitespace-nowrap text-base text-gray-300 align-middle text-left">{product.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {products.length === 0 && (
        <div className="p-8 text-center text-gray-500">No line items found.</div>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-0 md:space-y-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {tabs.map(tab => (
              <button
                key={tab.value}
                className={`group relative px-6 py-3 text-sm font-medium ${
                  activeType === tab.value ? 'text-blue-500' : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveType(tab.value)}
              >
                {tab.label}
                <span
                  className={`absolute left-0 right-0 bottom-0 h-0.5 transition-colors duration-150
                    ${activeType === tab.value ? 'bg-blue-500' : 'bg-transparent group-hover:bg-blue-500'}`}
                />
              </button>
            ))}
          </div>
          {/* Top right actions: ellipsis only */}
          <div className="flex items-center gap-2">
            <div className="relative pr-4" ref={menuRef}>
              <button
                aria-label="menu"
                className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800"
                style={{ marginLeft: 'auto' }}
                onClick={() => setMenuOpen((v) => !v)}
              >
                <MoreVertical className="w-6 h-6" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#232632] rounded-xl shadow-lg z-50 py-2 flex flex-col min-w-[200px]">
                  <button
                    className="flex items-center gap-3 px-5 py-3 text-white text-base font-medium hover:bg-[#2A2E39] rounded-xl transition-colors"
                    onClick={() => { setShowNewModal(true); setMenuOpen(false); }}
                  >
                    <Plus className="w-5 h-5" />
                    New Line Item
                  </button>
                  <button
                    className="flex items-center gap-3 px-5 py-3 text-white text-base font-medium hover:bg-[#2A2E39] rounded-xl transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Plus className="w-5 h-5" />
                    New Category
                  </button>
                  <button
                    className="px-5 py-3 text-white text-base text-left hover:bg-[#2A2E39] rounded-xl transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    Import Items
                  </button>
                  <button
                    className="px-5 py-3 text-white text-base text-left hover:bg-[#2A2E39] rounded-xl transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    Export Price Book
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Table */}
        <div className="pt-0">
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
