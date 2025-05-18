import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, ChevronDown, Upload, Download, Printer, Filter, X } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import ProductAssemblyForm from './ProductAssemblyForm';
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
};

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
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [sortBy] = useState('price-asc');

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

  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const optionsMenuRef = useRef<HTMLDivElement>(null);

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
        setShowOptionsMenu(false);
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

  return (
    <DashboardLayout>
      <div className="bg-[#121212] min-h-screen relative flex flex-col px-8 py-6">
        <div className="relative flex items-center justify-between px-8 py-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Products</h1>
            <p className="text-gray-400">Manage all your products and assemblies in one place</p>
          </div>
          
          <div className="flex items-center gap-3">
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
        
        {/* Category and Subcategory Selectors */}
        <div className="px-8 pt-6 pb-2">
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
        
        {/* Product Cards with Expand/Collapse */}
        <div className="px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-20">No products/assemblies found.</div>
            ) : (
              filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="bg-[#121212] rounded-lg overflow-hidden border border-gray-700 hover:border-blue-500 transition-all shadow-lg hover:shadow-blue-900/20 relative group flex flex-col justify-between min-h-[240px]"
                >
                  {/* Premium badge */}
                  {product.premium && (
                    <div className="absolute left-0 top-0 bg-amber-600 text-white px-3 py-1 text-xs font-semibold rounded-br z-10">Premium</div>
                  )}
                  
                  {/* Three-dot menu button */}
                  <div className="absolute top-3 right-3 z-10">
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
                        className="absolute right-0 top-8 w-48 bg-[#232635] rounded-md shadow-lg z-10 py-1 border border-gray-600"
                        onClick={e => e.stopPropagation()}
                      >

                        <button className="w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-600" onClick={() => { setOpenMenuId(null); /* TODO: Add to invoice */ }}>
                          Add to package
                        </button>
                        <button className="w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-600" onClick={() => { setOpenMenuId(null); handleDuplicate(product); }}>
                          Duplicate
                        </button>
                        <button className="w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-600" onClick={() => { setOpenMenuId(null); /* TODO: Change category */ }}>
                          Change category
                        </button>
                        <button className="w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-600" onClick={() => { setOpenMenuId(null); /* TODO: View usage stats */ }}>
                          View usage stats
                        </button>
                        <div className="border-t border-gray-600 my-1"></div>
                        <button className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-600" onClick={() => { setOpenMenuId(null); setDeletingProduct(product); }}>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 p-5 flex flex-col">
                    <h3 className="text-lg font-semibold mb-1 text-white">{product.name}</h3>
                    {product.description && (
                      <p className="text-gray-400 text-sm">{product.description}</p>
                    )}
                    {/* Package count indicator */}
                    <div className="mt-2 mb-2">
                      <span className="text-indigo-400 text-xs">In {Math.floor(Math.random() * 5) + 1} packages</span>
                    </div>
                    <div className="flex justify-between items-end mt-auto">
                      <div className="text-2xl font-bold text-[#0050FF]">
                        ${product.price.toFixed(2)}
                        <span className="text-sm text-gray-400 font-normal ml-1">/{product.unit}</span>
                      </div>
                      {/* Item count indicator */}
                      <div className="bg-[#232635] px-3 py-1 rounded-md text-center">
                        <div className="text-white font-medium">{Math.floor(Math.random() * 10) + 1}</div>
                        <div className="text-gray-400 text-xs">items</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick actions bar */}
                  <div className="flex justify-between items-center px-4 py-3 border-t border-gray-700">
                    <button
                      className="text-sm text-gray-300 hover:underline focus:outline-none"
                      style={{ background: 'none', border: 'none', padding: 0, fontWeight: 400 }}
                      onClick={() => setEditingProduct(product)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-sm text-gray-400 hover:underline focus:outline-none"
                      style={{ background: 'none', border: 'none', padding: 0, fontWeight: 400 }}
                      onClick={() => {
                        // TODO: Implement add to package functionality
                        setOpenMenuId(null);
                      }}
                    >
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
            <div className="fixed inset-0 z-[60] bg-black bg-opacity-50" onClick={() => setEditingProduct(null)}></div>
            <div
              className={`fixed top-0 right-0 h-full w-[50vw] max-w-full z-[70] bg-[#121212] shadow-xl transition-transform duration-300 ease-in-out ${(editingProduct || editingProduct === 'new') ? 'translate-x-0' : 'translate-x-full'}`}
            >
              <div className="h-full overflow-y-auto p-6">
                <ProductAssemblyForm
                  lineItems={lineItems}
                  editingProduct={editingProduct === 'new' ? null : editingProduct}
                  onClose={() => setEditingProduct(null)}
                  onSave={async (data) => {
                    try {
                      if (editingProduct === 'new') {
                        if (!user) {
                          console.error('No user found, cannot create product');
                          return;
                        }
                        const { error } = await supabase.from('products').insert([
                          {
                            name: data.name,
                            description: data.description,
                            items: data.items,
                            user_id: user.id,
                            price: data.price,
                            unit: data.unit,
                            type: data.type,
                            category: data.category,
                          },
                        ]);
                        if (error) throw error;
                      } else {
                        const { error } = await supabase
                          .from('products')
                          .update({
                            name: data.name,
                            description: data.description,
                            items: data.items,
                            price: data.price,
                            unit: data.unit,
                            type: data.type,
                            category: data.category,
                          })
                          .eq('id', editingProduct.id);
                        if (error) throw error;
                      }
                      fetchProducts();
                      setEditingProduct(null);
                    } catch (err) {
                      console.error('Error saving product:', err);
                    }
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}; 