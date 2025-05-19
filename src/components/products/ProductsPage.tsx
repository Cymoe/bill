import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, ChevronDown, Upload, Download, Printer, Filter, X } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ProductAssemblyForm } from './ProductAssemblyForm';
import { PageHeader } from '../common/PageHeader';

// Product type
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  user_id: string;
  created_at: string;
  type?: string;
  items?: { lineItemId: string; quantity: number }[];
  category?: string;
  premium?: boolean;
  lineItems?: any[];
  packages?: any[];
};

interface LineItem {
  lineItemId: string;
  quantity: number;
  unit: string;
  price: number;
  type?: string;
}

interface SaveData {
  name: string;
  description: string;
  items: LineItem[];
}

const CATEGORY_COLORS = {
  interior: 'bg-purple-700',
  exterior: 'bg-blue-700',
  installation: 'bg-green-700',
  construction: 'bg-yellow-700',
};

export const ProductsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null | 'new'>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const createDropdownRef = useRef<HTMLDivElement>(null);
  const createButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('created-desc');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  
  // Helper function to get the label for the current sort option
  const getSortLabel = (sortOption: string): string => {
    switch (sortOption) {
      case 'name-asc': return 'Name';
      case 'price-desc': return 'Price (High-Low)';
      case 'price-asc': return 'Price (Low-High)';
      case 'most-used': return 'Most Used';
      case 'created-desc': return 'Recently Used';
      case 'created-asc': return 'Oldest First';
      default: return 'Recently Used';
    }
  };

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
      fetchLineItems();
    }
  }, [user]);

  const fetchLineItems = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, unit, price, type, trade:trades(name)')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      console.log('Fetched line items:', data);
      setLineItems((data || []).map((li: any) => ({
        ...li,
        trade: li.trade?.name || null
      })));
    } catch (error) {
      console.error('Error fetching line items:', error);
    }
  };

  useEffect(() => {
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
    function handleClick(event: MouseEvent) {
      if (openMenuId && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [openMenuId]);

  const fetchProducts = async () => {
    try {
      // Fetch all products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (productsError) throw productsError;

      // Fetch all product_line_items
      const { data: pliData, error: pliError } = await supabase
        .from('product_line_items')
        .select('*');
      if (pliError) throw pliError;

      // Attach line items to each product
      const productsWithItems = (productsData || []).map((product) => ({
        ...product,
        items: pliData.filter((pli) => pli.product_id === product.id)
      }));
      setProducts(productsWithItems);
      console.log('Fetched products:', productsWithItems);
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
      if (sortBy === 'created-desc') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'created-asc') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
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

  // Functions for the new menu options
  const handleImportItems = () => {
    // TODO: Implement import functionality
    console.log('Import items clicked');
  };

  const handleExportToCSV = () => {
    // TODO: Implement export to CSV functionality
    console.log('Export to CSV clicked');
  };

  const handlePrintPriceBook = () => {
    // TODO: Implement print price book functionality
    console.log('Print price book clicked');
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
        setShowOptionsMenu(false);
      }
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setShowSortMenu(false);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target as Node)) {
        setShowCategoryMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handler = () => setEditingProduct('new');
    window.addEventListener('openNewProductDrawer', handler);
    return () => window.removeEventListener('openNewProductDrawer', handler);
  }, []);

  useEffect(() => {
    console.log('Current editingProduct state:', editingProduct);
  }, [editingProduct]);

  useEffect(() => {
    console.log('Current lineItems state:', lineItems);
  }, [lineItems]);

  return (
    <DashboardLayout>
      <div className="bg-[#121212] min-h-screen relative flex flex-col px-0 py-0">
        {/* Mobile header - only visible on mobile */}
        <div className="md:hidden relative flex flex-col space-y-4 pb-4 border-b border-gray-800 px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Products</h1>
            <div className="flex space-x-2">
              <button 
                className="p-2 rounded-full bg-[#232635] text-white"
                onClick={() => setShowFilter(!showFilter)}
              >
                <Filter size={20} />
              </button>
              <button 
                className="p-2 rounded-full bg-[#232635] text-white"
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              >
                <MoreVertical size={20} />
              </button>
            </div>
          </div>
          <p className="text-gray-400">Manage all your products and assemblies in one place</p>
        </div>
        
        {/* Mobile filter and sort options - only visible on mobile */}
        <div className="md:hidden flex flex-col space-y-4 mt-4 px-2 sm:px-4">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4">
            {/* Category Filter Dropdown - Mobile */}
            <div className="w-full relative" ref={categoryMenuRef}>
              <button 
                className="w-full flex items-center justify-between px-4 py-2 bg-[#232635] border border-gray-700 rounded-full text-white"
                onClick={() => setShowCategoryMenu(!showCategoryMenu)}
              >
                <span className="truncate">All Categories (40)</span>
                <ChevronDown size={16} />
              </button>
              
              {showCategoryMenu && (
                <div className="absolute left-0 right-0 top-12 bg-[#232635] rounded-md shadow-lg z-10 py-0.5 border border-gray-600">
                  <button 
                    className="w-full text-left px-4 py-3 text-white hover:bg-gray-600 flex items-center gap-2"
                    onClick={() => {
                      setSelectedCategory('all');
                      setShowCategoryMenu(false);
                    }}
                  >
                    <span className="ml-2">All Categories</span>
                  </button>
                </div>
              )}
            </div>
            
            {/* Sort Dropdown - Mobile */}
            <div className="w-full relative" ref={sortMenuRef}>
              <button 
                className="w-full flex items-center justify-between px-4 py-2 bg-[#232635] border border-gray-700 rounded-full text-white"
                onClick={() => setShowSortMenu(!showSortMenu)}
              >
                <span className="truncate">Sort by: {getSortLabel(sortBy)}</span>
                <ChevronDown size={16} />
              </button>
              
              {showSortMenu && (
                <div className="absolute left-0 right-0 top-12 bg-[#232635] rounded-md shadow-lg z-10 py-0.5 border border-gray-600">
                  <button 
                    className={`w-full text-left px-4 py-3 text-white hover:bg-gray-600 flex items-center gap-2 ${sortBy === 'name-asc' ? 'bg-green-700' : ''}`}
                    onClick={() => {
                      setSortBy('name-asc');
                      setShowSortMenu(false);
                    }}
                  >
                    {sortBy === 'name-asc' && <span className="text-white">✓</span>}
                    <span className={sortBy === 'name-asc' ? 'ml-2' : 'ml-6'}>Sort by: Name</span>
                  </button>
                  <button 
                    className={`w-full text-left px-4 py-3 text-white hover:bg-gray-600 flex items-center gap-2 ${sortBy === 'price-desc' ? 'bg-green-700' : ''}`}
                    onClick={() => {
                      setSortBy('price-desc');
                      setShowSortMenu(false);
                    }}
                  >
                    {sortBy === 'price-desc' && <span className="text-white">✓</span>}
                    <span className={sortBy === 'price-desc' ? 'ml-2' : 'ml-6'}>Sort by: Price (High-Low)</span>
                  </button>
                  <button 
                    className={`w-full text-left px-4 py-3 text-white hover:bg-gray-600 flex items-center gap-2 ${sortBy === 'most-used' ? 'bg-green-700' : ''}`}
                    onClick={() => {
                      setSortBy('most-used');
                      setShowSortMenu(false);
                    }}
                  >
                    {sortBy === 'most-used' && <span className="text-white">✓</span>}
                    <span className={sortBy === 'most-used' ? 'ml-2' : 'ml-6'}>Sort by: Recently Used</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Desktop header - hidden on mobile */}
        <div className="hidden md:flex relative items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Products</h1>
            <p className="text-gray-400">Manage all your products and assemblies in one place</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Sort By Dropdown */}
            <div className="relative" ref={sortMenuRef}>
              <button 
                className="flex items-center gap-2 px-4 py-2 bg-[#232635] border border-gray-700 rounded-full text-white hover:bg-gray-700"
                onClick={() => setShowSortMenu(!showSortMenu)}
              >
                <span>Sort by: {getSortLabel(sortBy)}</span>
                <ChevronDown size={16} />
              </button>
              
              {showSortMenu && (
                <div className="absolute left-0 top-12 w-64 bg-[#232635] rounded-md shadow-lg z-10 py-0.5 border border-gray-600">
                  <button 
                    className={`w-full text-left px-4 py-3 text-white hover:bg-gray-600 flex items-center gap-2 ${sortBy === 'name-asc' ? 'bg-green-700' : ''}`}
                    onClick={() => {
                      setSortBy('name-asc');
                      setShowSortMenu(false);
                    }}
                  >
                    {sortBy === 'name-asc' && <span className="text-white">✓</span>}
                    <span className={sortBy === 'name-asc' ? 'ml-2' : 'ml-6'}>Sort by: Name</span>
                  </button>
                  <button 
                    className={`w-full text-left px-4 py-3 text-white hover:bg-gray-600 flex items-center gap-2 ${sortBy === 'price-desc' ? 'bg-green-700' : ''}`}
                    onClick={() => {
                      setSortBy('price-desc');
                      setShowSortMenu(false);
                    }}
                  >
                    {sortBy === 'price-desc' && <span className="text-white">✓</span>}
                    <span className={sortBy === 'price-desc' ? 'ml-2' : 'ml-6'}>Sort by: Price (High-Low)</span>
                  </button>
                  <button 
                    className={`w-full text-left px-4 py-3 text-white hover:bg-gray-600 flex items-center gap-2 ${sortBy === 'price-asc' ? 'bg-green-700' : ''}`}
                    onClick={() => {
                      setSortBy('price-asc');
                      setShowSortMenu(false);
                    }}
                  >
                    {sortBy === 'price-asc' && <span className="text-white">✓</span>}
                    <span className={sortBy === 'price-asc' ? 'ml-2' : 'ml-6'}>Sort by: Price (Low-High)</span>
                  </button>
                  <button 
                    className={`w-full text-left px-4 py-3 text-white hover:bg-gray-600 flex items-center gap-2 ${sortBy === 'most-used' ? 'bg-green-700' : ''}`}
                    onClick={() => {
                      setSortBy('most-used');
                      setShowSortMenu(false);
                    }}
                  >
                    {sortBy === 'most-used' && <span className="text-white">✓</span>}
                    <span className={sortBy === 'most-used' ? 'ml-2' : 'ml-6'}>Sort by: Most Used</span>
                  </button>
                  <button 
                    className={`w-full text-left px-4 py-3 text-white hover:bg-gray-600 flex items-center gap-2 ${sortBy === 'created-desc' ? 'bg-green-700' : ''}`}
                    onClick={() => {
                      setSortBy('created-desc');
                      setShowSortMenu(false);
                    }}
                  >
                    {sortBy === 'created-desc' && <span className="text-white">✓</span>}
                    <span className={sortBy === 'created-desc' ? 'ml-2' : 'ml-6'}>Sort by: Recently Used</span>
                  </button>
                </div>
              )}
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Search products by name, type, or price range..."
                className="w-64 px-4 py-2 bg-[#1E2130] border border-gray-700 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button
              className="flex items-center gap-2 px-4 py-2 bg-[#232635] border border-gray-700 rounded-full text-white hover:bg-gray-700"
              onClick={() => setShowFilter(true)}
            >
              <Filter size={16} />
              <span>Filter</span>
            </button>
            
            <div className="relative" ref={optionsMenuRef}>
              <button
                className="p-2 bg-[#232635] border border-gray-700 rounded-full text-white hover:bg-gray-700"
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              >
                <MoreVertical size={20} />
              </button>
              
              {showOptionsMenu && (
                <div className="absolute right-0 top-12 w-48 bg-[#232635] rounded-md shadow-lg z-10 py-0.5 border border-gray-600">
                  <button 
                    className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-600 flex items-center gap-2" 
                    onClick={() => {
                      setShowOptionsMenu(false);
                      handleImportItems();
                    }}
                  >
                    <Upload size={16} className="text-gray-400" />
                    Import items
                  </button>
                  <button 
                    className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-600 flex items-center gap-2" 
                    onClick={() => {
                      setShowOptionsMenu(false);
                      handleExportToCSV();
                    }}
                  >
                    <Download size={16} className="text-gray-400" />
                    Export to CSV
                  </button>
                  <button 
                    className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-600 flex items-center gap-2" 
                    onClick={() => {
                      setShowOptionsMenu(false);
                      handlePrintPriceBook();
                    }}
                  >
                    <Printer size={16} className="text-gray-400" />
                    Print price book
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Category and Subcategory Selectors - hidden on mobile */}
        <div className="hidden md:block px-4 pt-4 pb-2">
          <div className="flex items-center gap-3">
            <div className="relative max-w-xs">
              <select
                className="appearance-none w-full bg-[#1E2130] border border-gray-700 px-4 py-2 pr-8 rounded-full text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
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
                  className="appearance-none w-full bg-[#1E2130] border border-gray-700 px-4 py-2 pr-8 rounded-full text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
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
        
        {/* Product Grid */}
        <div className="px-2 sm:px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-20">No products/assemblies found.</div>
            ) : (
              filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="bg-[#232635] rounded-xl border border-[#2A3A8F] p-3 sm:p-6 flex flex-col h-[220px] w-full min-w-0 relative"
                >

                  {/* Three-dot menu button */}
                  <div className="absolute top-3 right-3 z-10">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === product.id ? null : product.id);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-300 rounded-full hover:bg-gray-800"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenuId === product.id && (
                        <div
                          ref={menuRef}
                          className="absolute right-0 top-8 w-48 bg-[#232635] rounded-md shadow-lg z-10 py-1 border border-gray-600"
                          onClick={e => {
                            console.log('Dropdown menu clicked');
                            e.stopPropagation();
                          }}
                        >
                          <button 
                            className="w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-600" 
                            onClick={(e) => { 
                              console.log('Edit button clicked for product:', product);
                              e.preventDefault();
                              e.stopPropagation();
                              setOpenMenuId(null); 
                              setEditingProduct(product);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-600"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setOpenMenuId(null);
                              setDeletingProduct(product);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-full overflow-hidden">
                      <h2 className="text-xl sm:text-2xl font-bold text-white truncate max-w-full">{product.name}</h2>
                    </div>
                  </div>

                  {product.description && (
                    <div className="text-gray-400 w-full overflow-hidden h-[48px] mb-2">
                      <p className="text-xs sm:text-sm line-clamp-2 break-words leading-5 sm:leading-6">{product.description}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-gray-400 text-xs sm:text-sm mb-2 sm:mb-4">
                    <span>{product.items?.length || 0} items</span>
                    <span>In <span className="text-blue-400 font-semibold">{product.packages?.length || 0} packages</span></span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-0 mt-auto">
                    <div>
                      <span className="text-lg sm:text-xl font-bold text-white">{formatCurrency(product.price)}</span>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded transition-colors whitespace-nowrap w-full sm:w-auto sm:min-w-[120px] text-center">
                      Add to package
                    </button>
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
        
        {/* Edit/Create Product/Assembly Drawer */}
        {(editingProduct || editingProduct === 'new') && (
          <>
            <div 
              className="fixed inset-0 z-[60] bg-black bg-opacity-50" 
              onClick={() => setEditingProduct(null)}
            />
            <div
              className="fixed top-0 right-0 h-full w-[50vw] max-w-full z-[70] bg-[#121212] shadow-xl overflow-y-auto"
            >
              <div className="p-4">
                <ProductAssemblyForm
                  lineItems={lineItems}
                  onClose={() => {
                    console.log('Closing form');
                    setEditingProduct(null);
                  }}
                  onSave={async (data: SaveData) => {
                    console.log('Saving product:', data);
                    try {
                      // Transform items data for the database
                      const transformedItems = data.items.map((item: LineItem) => ({
                        line_item_id: item.lineItemId,
                        quantity: item.quantity,
                        unit: item.unit,
                        price: item.price
                      }));

                      if (editingProduct && editingProduct !== 'new') {
                        // Update existing product
                        const { error: deleteError } = await supabase
                          .from('product_line_items')
                          .delete()
                          .eq('product_id', editingProduct.id);
                        if (deleteError) throw deleteError;

                        const { error: productError } = await supabase
                          .from('products')
                          .update({
                            name: data.name,
                            description: data.description,
                            status: 'published'
                          })
                          .eq('id', editingProduct.id);
                        if (productError) throw productError;

                        if (transformedItems.length > 0) {
                          const { error: itemsError } = await supabase
                            .from('product_line_items')
                            .insert(transformedItems.map((item) => ({
                              ...item,
                              product_id: editingProduct.id
                            })));
                          if (itemsError) throw itemsError;
                        }
                      } else {
                        // Create new product
                        const { data: newProduct, error: productError } = await supabase
                          .from('products')
                          .insert([{
                            name: data.name,
                            description: data.description,
                            user_id: user?.id,
                            status: 'published'
                          }])
                          .select()
                          .single();
                        if (productError) throw productError;

                        if (transformedItems.length > 0) {
                          const { error: itemsError } = await supabase
                            .from('product_line_items')
                            .insert(transformedItems.map((item) => ({
                              ...item,
                              product_id: newProduct.id
                            })));
                          if (itemsError) throw itemsError;
                        }
                      }
                      fetchProducts();
                      setEditingProduct(null);
                    } catch (error) {
                      console.error('Error saving product:', error);
                    }
                  }}
                  editingProduct={editingProduct === 'new' ? null : editingProduct}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};