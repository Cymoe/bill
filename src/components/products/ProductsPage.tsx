import React, { useState, useEffect, useRef } from 'react';
import { Plus, MoreVertical, X, Search, Home, Layers, Wrench, Hammer, ChevronDown, ChevronRight, Filter, Wind, Shield } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Dropdown } from '../common/Dropdown';
import { EditProductModal } from './EditProductModal';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';
import { ProductCardSkeleton } from '../skeletons/ProductCardSkeleton';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import ProductAssemblyForm from './ProductAssemblyForm';
import { CreateDropdown } from '../common/CreateModal';
import PageHeader from '../common/PageHeader';

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
  category?: string;
  premium?: boolean;
  lineItems?: any[];
};

const CATEGORY_TABS = [
  { label: 'All', value: 'all' },
  { label: 'Interior', value: 'interior', icon: <Layers className="w-4 h-4" /> },
  { label: 'Exterior', value: 'exterior', icon: <Home className="w-4 h-4" /> },
  { label: 'Installation', value: 'installation', icon: <Wrench className="w-4 h-4" /> },
  { label: 'Construction', value: 'construction', icon: <Hammer className="w-4 h-4" /> },
];

const CATEGORY_COLORS = {
  interior: 'bg-purple-700',
  exterior: 'bg-blue-700',
  installation: 'bg-green-700',
  construction: 'bg-yellow-700',
};

const SORT_OPTIONS = [
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Name: A-Z', value: 'name-asc' },
  { label: 'Name: Z-A', value: 'name-desc' },
];

export const ProductsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewAssemblyModal, setShowNewAssemblyModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const createDropdownRef = useRef<HTMLDivElement>(null);
  const createButtonRef = useRef<HTMLButtonElement>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('price-asc');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [status, setStatus] = useState('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const CATEGORY_OPTIONS = [
    { value: 'all', label: 'All Categories (40)' },
    { value: 'interior', label: 'Interior (9)' },
    { value: 'exterior', label: 'Exterior (8)' },
    { value: 'installation', label: 'Installation (12)' },
    { value: 'construction', label: 'Construction (6)' },
    { value: 'plumbing', label: 'Plumbing (5)' },
    { value: 'hvac', label: 'HVAC (4)' },
  ];
  const SUBCATEGORY_OPTIONS: Record<string, { value: string, label: string }[]> = {
    installation: [
      { value: 'floor', label: 'Floor Installation' },
      { value: 'window', label: 'Window Installation' },
      { value: 'door', label: 'Door Installation' },
      { value: 'cabinet', label: 'Cabinet Installation' },
    ],
    interior: [
      { value: 'painting', label: 'Painting' },
      { value: 'flooring', label: 'Flooring' },
      { value: 'tiling', label: 'Tiling' },
      { value: 'cabinetry', label: 'Cabinetry' },
    ],
    exterior: [
      { value: 'siding', label: 'Siding' },
      { value: 'roofing', label: 'Roofing' },
      { value: 'gutters', label: 'Gutters' },
      { value: 'deck', label: 'Deck Building' },
    ],
    hvac: [
      { value: 'ac', label: 'Air Conditioning' },
      { value: 'heating', label: 'Heating' },
      { value: 'ventilation', label: 'Ventilation' },
    ],
  };

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  useEffect(() => {
    if (!showCreateModal) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        createDropdownRef.current &&
        !createDropdownRef.current.contains(event.target as Node) &&
        createButtonRef.current &&
        !createButtonRef.current.contains(event.target as Node)
      ) {
        setShowCreateModal(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCreateModal]);

  useEffect(() => {
    function handleClick() {
      if (openMenuId) setOpenMenuId(null);
    }
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [openMenuId]);

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

  const filteredProducts = products
    .filter((product) => {
      // Category
      if (selectedCategory !== 'all' && product.category?.toLowerCase() !== selectedCategory) return false;
      // Subcategory (if present on Product type)
      // if (selectedCategory !== 'all' && selectedSubcategory !== 'all' && product.subcategory && product.subcategory.toLowerCase() !== selectedSubcategory) return false;
      // Search
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        if (
          !product.name.toLowerCase().includes(s) &&
          !product.description?.toLowerCase().includes(s) &&
          !product.type?.toLowerCase().includes(s) &&
          !(product.price && product.price.toString().includes(s))
        ) return false;
      }
      // Price
      if (priceMin && product.price < parseFloat(priceMin)) return false;
      if (priceMax && product.price > parseFloat(priceMax)) return false;
      // Status (if present on Product type)
      // if (status !== 'all' && product.status !== status) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      return 0;
    });

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

  const handleDuplicate = async (product: Product) => {
    // Remove id, created_at, etc. Add 'Copy' to name.
    const { id, created_at, ...rest } = product;
    const newProduct = { ...rest, name: product.name + ' (Copy)' };
    try {
      const { error } = await supabase.from('products').insert([newProduct]);
      if (error) throw error;
      fetchProducts();
    } catch (err) {
      console.error('Error duplicating product:', err);
    }
  };

  const getCategoryColor = (cat?: string) => {
    if (!cat) return 'bg-gray-700';
    const key = cat.toLowerCase() as keyof typeof CATEGORY_COLORS;
    return CATEGORY_COLORS[key] || 'bg-gray-700';
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Products"
        subtitle="Manage all your products and assemblies in one place"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onFilter={() => setShowFilter(true)}
        onMenu={() => setShowMenu(true)}
      />
      {/* INSERT new search/filter/category/subcategory UI here */}
      <div className="px-8 pt-6">
        <div className="flex items-center mb-8">
          <div className="relative flex-1 max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search products by name, type, or price range..."
              className="block w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-l-lg focus:ring-blue-500 focus:border-blue-500 text-gray-200"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <button
              className="flex items-center bg-gray-800 border border-gray-700 border-l-0 px-5 py-3 rounded-r-lg hover:bg-gray-700 transition-colors"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              type="button"
            >
              <Filter size={20} className="text-blue-400 mr-2" />
              <span className="text-gray-200">Filter</span>
            </button>
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-20">
                <div className="p-4">
                  <h3 className="font-medium mb-3">Filter By:</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm mb-1">Price Range</label>
                      <div className="flex items-center">
                        <input className="w-full bg-gray-700 rounded p-2 text-sm" placeholder="Min" value={priceMin} onChange={e => setPriceMin(e.target.value)} />
                        <span className="mx-2">-</span>
                        <input className="w-full bg-gray-700 rounded p-2 text-sm" placeholder="Max" value={priceMax} onChange={e => setPriceMax(e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Status</label>
                      <select className="w-full bg-gray-700 rounded p-2 text-sm" value={status} onChange={e => setStatus(e.target.value)}>
                        <option value="all">All</option>
                        <option value="active">Active</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button className="bg-gray-700 px-3 py-1 rounded mr-2 text-sm" onClick={() => { setPriceMin(''); setPriceMax(''); setStatus('all'); }}>Reset</button>
                    <button className="bg-blue-600 px-3 py-1 rounded text-sm" onClick={() => setIsFilterOpen(false)}>Apply</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3 mb-4">
          <h3 className="text-base font-medium text-gray-300">Category:</h3>
          <div className="relative flex-1 max-w-xs">
            <select
              className="appearance-none w-full bg-gray-800 border border-gray-700 px-4 py-2 pr-8 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value);
                setSelectedSubcategory('all');
              }}
            >
              {CATEGORY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>
          {selectedCategory !== 'all' && SUBCATEGORY_OPTIONS[selectedCategory] && (
            <div className="relative max-w-xs">
              <select
                className="appearance-none w-full bg-gray-800 border border-gray-700 px-4 py-2 pr-8 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                value={selectedSubcategory}
                onChange={e => setSelectedSubcategory(e.target.value)}
              >
                <option value="all">All {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Types</option>
                {SUBCATEGORY_OPTIONS[selectedCategory].map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Product Cards with Expand/Collapse */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-20">No products/assemblies found.</div>
          ) : (
            filteredProducts.map(product => (
              <div
                key={product.id}
                className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-blue-500 transition-all shadow-lg hover:shadow-blue-900/20 relative group"
              >
                {/* Premium badge */}
                {product.premium && (
                  <div className="absolute right-0 top-0 bg-amber-600 text-white px-3 py-1 text-xs font-semibold rounded-bl z-10">Premium</div>
                )}
                <div className="p-5 flex items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className={`w-8 h-8 rounded mr-3 flex items-center justify-center ${
                        product.category?.toLowerCase() === 'interior' ? 'bg-purple-900' :
                        product.category?.toLowerCase() === 'exterior' ? 'bg-blue-900' :
                        product.category?.toLowerCase() === 'installation' ? 'bg-green-900' :
                        product.category?.toLowerCase() === 'construction' ? 'bg-amber-900' :
                        product.category?.toLowerCase() === 'hvac' ? 'bg-indigo-900' :
                        product.category?.toLowerCase() === 'plumbing' ? 'bg-cyan-900' : 'bg-gray-700'
                      }`}>
                        {/* Icon */}
                        {product.category?.toLowerCase() === 'interior' && <Layers size={18} className="text-purple-400" />}
                        {product.category?.toLowerCase() === 'exterior' && <Home size={18} className="text-blue-400" />}
                        {product.category?.toLowerCase() === 'installation' && <Wrench size={18} className="text-green-400" />}
                        {product.category?.toLowerCase() === 'construction' && <Hammer size={18} className="text-amber-400" />}
                        {product.category?.toLowerCase() === 'hvac' && <Wind size={18} className="text-indigo-400" />}
                        {product.category?.toLowerCase() === 'plumbing' && <Shield size={18} className="text-cyan-400" />}
                        {/* fallback: <Package size={18} className="text-gray-400" /> */}
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        product.category?.toLowerCase() === 'interior' ? 'bg-purple-900 bg-opacity-30 text-purple-300' :
                        product.category?.toLowerCase() === 'exterior' ? 'bg-blue-900 bg-opacity-30 text-blue-300' :
                        product.category?.toLowerCase() === 'installation' ? 'bg-green-900 bg-opacity-30 text-green-300' :
                        product.category?.toLowerCase() === 'construction' ? 'bg-amber-900 bg-opacity-30 text-amber-300' :
                        product.category?.toLowerCase() === 'hvac' ? 'bg-indigo-900 bg-opacity-30 text-indigo-300' :
                        product.category?.toLowerCase() === 'plumbing' ? 'bg-cyan-900 bg-opacity-30 text-cyan-300' : 'bg-gray-700 text-gray-300'
                      }`}>
                        {product.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-1 text-white">{product.name}</h3>
                    <p className="text-gray-400 text-sm mb-4">{product.description}</p>
                    <div className="text-xl font-bold text-blue-400">
                      {formatCurrency(product.price)}
                      {product.unit && <span className="text-sm text-gray-400 font-normal ml-1">/{product.unit}</span>}
                    </div>
                  </div>
                  {/* Three-dot menu button */}
                  <div className="relative">
                    <button
                      className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700"
                      onClick={e => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === product.id ? null : product.id);
                      }}
                    >
                      <MoreVertical size={20} />
                    </button>
                    {openMenuId === product.id && (
                      <div
                        className="absolute right-0 top-8 w-48 bg-gray-700 rounded-md shadow-lg z-10 py-1 border border-gray-600"
                        onClick={e => e.stopPropagation()}
                      >
                        <button className="w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-600 flex items-center" onClick={() => { setOpenMenuId(null); /* TODO: Add to package */ }}>
                          <span className="w-6 text-gray-400 mr-2">📦</span>
                          Add to package
                        </button>
                        <button className="w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-600 flex items-center" onClick={() => { setOpenMenuId(null); handleDuplicate(product); }}>
                          <span className="w-6 text-gray-400 mr-2">📋</span>
                          Duplicate
                        </button>
                        <button className="w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-600 flex items-center" onClick={() => { setOpenMenuId(null); /* TODO: Change category */ }}>
                          <span className="w-6 text-gray-400 mr-2">🏷️</span>
                          Change category
                        </button>
                        <button className="w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-600 flex items-center" onClick={() => { setOpenMenuId(null); /* TODO: View usage stats */ }}>
                          <span className="w-6 text-gray-400 mr-2">📊</span>
                          View usage stats
                        </button>
                        <button className="w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-600 flex items-center" onClick={() => { setOpenMenuId(null); /* TODO: Archive product */ }}>
                          <span className="w-6 text-gray-400 mr-2">🔒</span>
                          Archive product
                        </button>
                        <div className="border-t border-gray-600 my-1"></div>
                        <button className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-600 flex items-center" onClick={() => { setOpenMenuId(null); setDeletingProduct(product); }}>
                          <span className="w-6 mr-2">🗑️</span>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {/* Quick actions bar */}
                <div className="bg-gray-850 py-2 px-4 border-t border-gray-700 flex justify-between text-sm">
                  <button className="text-gray-400 hover:text-blue-400" onClick={() => setEditingProduct(product)}>Edit</button>
                  <button className="text-gray-400 hover:text-blue-400">Add to invoice</button>
                </div>
              </div>
            ))
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