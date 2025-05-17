import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, Upload, Download, Printer, ChevronDown } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

import { DashboardLayout } from '../layouts/DashboardLayout';
import { LineItemModal } from './LineItemModal';
import { EditProductModal } from './EditProductModal';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';
import { CreateDropdown } from '../common/CreateModal';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import TableHeader from './TableHeader';
import PageHeader from '../common/PageHeader';

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

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLineItemModal, setShowLineItemModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeType, setActiveType] = useState<string>('all');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [priceRange, setPriceRange] = useState<{min: string; max: string}>({ min: '', max: '' });
  const [filterUnit, setFilterUnit] = useState('any');
  const [priceSort, setPriceSort] = useState<'asc' | 'desc'>('desc');
  const menuRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);


  const getTypeCount = (type: string) => {
    if (type === 'all') return products.length;
    return products.filter(product => product.type === type).length;
  };

  const tabs = [
    { value: 'all', label: 'All', count: getTypeCount('all') },
    { value: 'material', label: 'Material', count: getTypeCount('material') },
    { value: 'labor', label: 'Labor', count: getTypeCount('labor') },
    { value: 'equipment', label: 'Equipment', count: getTypeCount('equipment') },
    { value: 'service', label: 'Service', count: getTypeCount('service') },
    { value: 'subcontractor', label: 'Subcontractor', count: getTypeCount('subcontractor') }
  ];

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node) &&
        filterButtonRef.current &&
        !filterButtonRef.current.contains(event.target as Node)
      ) {
        setShowFilter(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const applyFilters = () => {
    setShowFilter(false);
    setActiveType(filterType); // Sync the tab selection with filter type
  };

  let filteredProducts = products.filter(product => {
    // Type filter (use activeType from tabs)
    if (activeType !== 'all' && product.type !== activeType) return false;

    // Price range filter
    if (priceRange.min && parseFloat(priceRange.min) > product.price) return false;
    if (priceRange.max && parseFloat(priceRange.max) < product.price) return false;

    // Unit filter
    if (filterUnit !== 'any' && product.unit !== filterUnit) return false;

    return true;
  });

  // Sort by price
  filteredProducts = [...filteredProducts].sort((a, b) => {
    if (priceSort === 'asc') return a.price - b.price;
    return b.price - a.price;
  });

  const TableView: React.FC<{ products: Product[] }> = ({ products }) => (
    <div className="overflow-x-auto w-full">
      <table className="w-full table-fixed">
        <TableHeader 
          priceSort={priceSort}
          onPriceSort={() => setPriceSort(s => (s === 'asc' ? 'desc' : 'asc'))}
        />
        <tbody className="bg-gray-900 divide-y divide-gray-800">
          {products.map((product) => (
            <tr
              key={product.id}
              className="hover:bg-[#232632] cursor-pointer transition-colors"
              onClick={() => setEditingProduct(product)}
            >
              <td className="pl-8 pr-4 py-4 w-[20%] whitespace-nowrap text-sm font-semibold text-white/80 align-middle" data-testid="product-name">{product.name}</td>
              <td className="pl-8 pr-4 py-4 w-[40%] whitespace-nowrap text-base text-gray-300 align-middle">{product.description}</td>
              <td className="py-4 pr-3 whitespace-nowrap text-base text-white/80 align-middle text-right">{formatCurrency(product.price)}</td>
              <td className="py-4 pl-2 w-[120px] whitespace-nowrap text-base text-gray-300 align-middle text-left">
                <span className="inline-block bg-[#232632] text-[#A3A6AE] rounded-lg px-2 py-0.5 text-sm font-normal align-middle">
                  {product.unit}
                </span>
              </td>
              <td className="py-4 pr-3 w-[120px] whitespace-nowrap text-base align-middle text-center">
                <span className="inline-block bg-[#232F5B] text-[#3B82F6] rounded-lg px-3 py-0.5 text-sm font-medium align-middle">
                  {product.type === 'subcontractor' ? 'Sub' : product.type.charAt(0).toUpperCase() + product.type.slice(1)}
                </span>
              </td>
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
        {/* Header Section */}
        <div className="p-4 flex items-center justify-between border-b border-gray-800">
          <div className="flex flex-col justify-center">
            <h1 className="text-2xl font-semibold text-white mb-1">Price Book</h1>
            <p className="text-gray-400">Manage all your pricing items in one place</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative flex items-center gap-3">
              <input
                type="text"
                placeholder="Search items..."
                className="w-[220px] h-9 text-white placeholder-gray-400 rounded-lg pl-8 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                style={{ backgroundColor: 'rgb(31 41 55 / var(--tw-bg-opacity, 1))' }}
              />
              <svg
                className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <button
                ref={filterButtonRef}
                className="flex items-center gap-2 text-white px-3 h-9 rounded-lg text-sm hover:bg-[#2A2E39] transition-colors relative"
                style={{ backgroundColor: 'rgb(31 41 55 / var(--tw-bg-opacity, 1))' }}
                onClick={() => setShowFilter(v => !v)}
              >
                <svg
                  className="h-3.5 w-3.5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                <span className="text-sm">Filter</span>
              </button>
              <div className="relative ml-2" ref={menuRef}>
                <button
                  aria-label="menu"
                  className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800"
                  onClick={() => setMenuOpen((v) => !v)}
                >
                  <MoreVertical className="w-6 h-6" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-[220px] bg-[#232632] rounded-lg z-50 p-2.5 flex flex-col min-w-[180px]">
                    <button
                      className="flex items-center gap-2 px-3 py-2 text-[#A3A6AE] text-sm font-normal text-left hover:bg-[#282B34] rounded-lg transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Upload className="w-5 h-5 text-[#A3A6AE]" />
                      Import items
                    </button>
                    <button
                      className="flex items-center gap-2 px-3 py-2 text-[#A3A6AE] text-sm font-normal text-left hover:bg-[#282B34] rounded-lg transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Download className="w-5 h-5 text-[#A3A6AE]" />
                      Export to CSV
                    </button>
                    <button
                      className="flex items-center gap-2 px-3 py-2 text-[#A3A6AE] text-sm font-normal text-left hover:bg-[#282B34] rounded-lg transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Printer className="w-5 h-5 text-[#A3A6AE]" />
                      Print price book
                    </button>
                  </div>
                )}
              </div>
              {showFilter && (
                <div 
                  className="absolute right-0 top-full mt-2 w-[220px] bg-[#232632] rounded-lg z-50 p-3"
                  ref={filterRef}
                >
                  <h2 className="text-lg font-semibold text-white mb-4">Filter By</h2>
                  {/* Type Filter */}
                  <div className="mb-2">
                    <label className="block text-sm font-normal mb-1" style={{ color: '#A3A6AE' }}>Type</label>
                    <select
                      value={filterType}
                      onChange={e => setFilterType(e.target.value)}
                      className="w-full h-9 rounded-lg px-3 text-sm font-normal focus:outline-none"
                      style={{ background: '#232632', border: '1px solid #35373F', color: '#fff' }}
                    >
                      <option value="all">All Types</option>
                      <option value="material">Material</option>
                      <option value="labor">Labor</option>
                      <option value="equipment">Equipment</option>
                      <option value="service">Service</option>
                      <option value="subcontractor">Subcontractor</option>
                    </select>
                  </div>
                  {/* Price Range */}
                  <div className="mb-2">
                    <label className="block text-sm font-normal mb-1" style={{ color: '#A3A6AE' }}>Price Range</label>
                    <div className="flex items-center gap-2 w-full">
                      <input
                        type="text"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={e => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                        className="flex-1 h-9 rounded-lg px-3 text-sm font-normal focus:outline-none min-w-0 placeholder-[#7C7F87]"
                        style={{ background: '#232632', border: '1px solid #35373F', color: '#fff' }}
                      />
                      <span className="text-sm flex-shrink-0" style={{ color: '#A3A6AE' }}>to</span>
                      <input
                        type="text"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={e => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                        className="flex-1 h-9 rounded-lg px-3 text-sm font-normal focus:outline-none min-w-0 placeholder-[#7C7F87]"
                        style={{ background: '#232632', border: '1px solid #35373F', color: '#fff' }}
                      />
                    </div>
                  </div>
                  {/* Unit Filter */}
                  <div className="mb-4">
                    <label className="block text-sm font-normal mb-1" style={{ color: '#A3A6AE' }}>Unit</label>
                    <select
                      value={filterUnit}
                      onChange={e => setFilterUnit(e.target.value)}
                      className="w-full h-9 rounded-lg px-3 text-sm font-normal focus:outline-none"
                      style={{ background: '#232632', border: '1px solid #35373F', color: '#fff' }}
                    >
                      <option value="any">Any Unit</option>
                      <option value="hour">Hour</option>
                      <option value="sqft">Square Foot</option>
                      <option value="linear">Linear Foot</option>
                      <option value="unit">Unit</option>
                    </select>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex items-center justify-between mt-2 gap-2">
                    <button
                      onClick={() => {
                        setFilterType('all');
                        setPriceRange({ min: '', max: '' });
                        setFilterUnit('any');
                      }}
                      className="h-9 px-3 min-w-[60px] text-sm font-normal bg-transparent rounded-lg"
                      style={{ color: '#A3A6AE' }}
                    >
                      Reset
                    </button>
                    <button
                      onClick={applyFilters}
                      className="h-9 px-3 min-w-[110px] rounded-lg font-medium text-sm hover:bg-blue-600 transition-colors"
                      style={{ background: '#3B82F6', color: '#fff' }}
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sub Navigation */}
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
                <span className="flex items-center gap-2">
                  {tab.label}
                  <span className="px-2 py-0.5 text-xs rounded-full bg-gray-800">
                    {tab.count}
                  </span>
                </span>
                <span
                  className={`absolute left-0 right-0 bottom-0 h-0.5 transition-colors duration-150
                    ${activeType === tab.value ? 'bg-blue-500' : 'bg-transparent group-hover:bg-blue-500'}`}
                />
              </button>
            ))}
          </div>
        </div>
        {/* Table */}
        <div className="pt-0">
          <TableView products={filteredProducts} />
        </div>
      </div>
      {showCreateModal && (
        <CreateDropdown
          onCreateLineItem={() => {
            setShowCreateModal(false);
            setShowLineItemModal(true);
          }}
          onCreateCategory={() => {
            // TODO: Implement category creation
            setShowCreateModal(false);
          }}
          onCreateClient={() => {
            // TODO: Navigate to client creation
            setShowCreateModal(false);
          }}
          onCreateProject={() => {
            // TODO: Navigate to project creation
            setShowCreateModal(false);
          }}
          onCreateInvoice={() => {
            // TODO: Navigate to invoice creation
            setShowCreateModal(false);
          }}
          onCreateProduct={() => {
            // TODO: Navigate to product creation
            setShowCreateModal(false);
          }}
        />
      )}
      {showLineItemModal && (
        <LineItemModal
          onClose={() => setShowLineItemModal(false)}
          onSave={async (data) => {
            try {
              await supabase
                .from('products')
                .insert([{ ...data, user_id: user?.id }]);
              setShowLineItemModal(false);
              await fetchProducts();
            } catch (error) {
              console.error('Error saving product:', error);
            }
          }}
        />
      )}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={async (data: Partial<Product>) => {
            try {
              await supabase
                .from('products')
                .update(data)
                .eq('id', editingProduct.id);
              setEditingProduct(null);
              await fetchProducts();
            } catch (error) {
              console.error('Error updating product:', error);
            }
          }}
        />
      )}
      {deletingProduct && (
        <DeleteConfirmationModal
          title="Delete Product"
          message="Are you sure you want to delete this product? This action cannot be undone."
          onConfirm={async () => {
            await handleDeleteProduct(deletingProduct.id);
            setDeletingProduct(null);
          }}
          onCancel={() => setDeletingProduct(null)}
        />
      )}
    </DashboardLayout>
  );
};
