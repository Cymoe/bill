import React, { useState, useEffect, useMemo } from 'react';
import { Upload, Download } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../common/PageHeader';
import TableHeader from './TableHeader';
import TabMenu from '../common/TabMenu';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  user_id: string;
  created_at: string;
  type: string;
}

export const PriceBook = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedUnit, setSelectedUnit] = useState('any');
  const [priceSort, setPriceSort] = useState<'asc' | 'desc'>('desc');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    fetchProducts();
  }, [user?.id]);

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

  const filteredProducts = useMemo<Product[]>(() => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(product => {
        return (
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    if (activeCategory !== 'all') {
      filtered = filtered.filter(product => product.type.toLowerCase() === activeCategory);
    }

    // Apply price filter
    if (minPrice !== '') {
      filtered = filtered.filter(product => product.price >= parseFloat(minPrice));
    }

    if (maxPrice !== '') {
      filtered = filtered.filter(product => product.price <= parseFloat(maxPrice));
    }

    // Apply type filter from dropdown (if not using the tab menu)
    if (selectedType !== 'all' && activeCategory === 'all') {
      filtered = filtered.filter(product => product.type.toLowerCase() === selectedType);
    }

    // Apply unit filter
    if (selectedUnit !== 'any') {
      filtered = filtered.filter(product => product.unit.toLowerCase() === selectedUnit.toLowerCase());
    }

    return filtered.sort((a, b) => {
      if (priceSort === 'asc') {
        return a.price - b.price;
      } else {
        return b.price - a.price;
      }
    });
  }, [products, searchTerm, activeCategory, minPrice, maxPrice, selectedType, selectedUnit, priceSort]);

  return (
    <DashboardLayout>
      <div className="space-y-0">
        <PageHeader
          title="Price Book"
          subtitle="Manage all your pricing items in one place"
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          showSearch
          onFilter={() => setShowFilterMenu(!showFilterMenu)}
          searchPlaceholder="Search pricing items by name, type, or price range..."
          onMenu={() => setMenuOpen(!menuOpen)}
        />
        
        {/* Filter Menu */}
        {showFilterMenu && (
          <div className="p-4 bg-[#1E2130] border border-gray-800 rounded-lg mx-4 mt-4 shadow-lg">
            <h3 className="text-lg font-medium text-white mb-4">Filter By</h3>
            
            <div className="space-y-6">
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
                <div className="relative">
                  <select 
                    className="w-full appearance-none bg-[#232635] border border-gray-700 rounded-lg px-3 py-2 text-white pr-10"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="material">Material</option>
                    <option value="labor">Labor</option>
                    <option value="equipment">Equipment</option>
                    <option value="service">Service</option>
                    <option value="subcontractor">Subcontractor</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Price Range</label>
                <div className="grid grid-cols-5 gap-2 items-center">
                  <input 
                    type="number" 
                    placeholder="Min" 
                    className="col-span-2 w-full bg-[#232635] border border-gray-700 rounded-lg px-3 py-2 text-white"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <div className="text-center text-gray-500">to</div>
                  <input 
                    type="number" 
                    placeholder="Max" 
                    className="col-span-2 w-full bg-[#232635] border border-gray-700 rounded-lg px-3 py-2 text-white"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              {/* Unit Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Unit</label>
                <div className="relative">
                  <select 
                    className="w-full appearance-none bg-[#232635] border border-gray-700 rounded-lg px-3 py-2 text-white pr-10"
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                  >
                    <option value="any">Any Unit</option>
                    <option value="hour">Hour</option>
                    <option value="day">Day</option>
                    <option value="each">Each</option>
                    <option value="sq.ft">Sq.Ft</option>
                    <option value="sq.m">Sq.M</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex justify-between pt-2">
                <button 
                  className="px-6 py-2 bg-[#232635] text-gray-400 rounded-lg hover:bg-[#2A2F40]"
                  onClick={() => {
                    setSelectedType('all');
                    setMinPrice('');
                    setMaxPrice('');
                    setSelectedUnit('any');
                  }}
                >
                  Reset
                </button>
                <button 
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  onClick={() => setShowFilterMenu(false)}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
        
        <TabMenu
          items={[
            { id: 'all', label: 'All', count: products.length },
            { id: 'material', label: 'Material', count: products.filter(p => p.type.toLowerCase() === 'material').length },
            { id: 'labor', label: 'Labor', count: products.filter(p => p.type.toLowerCase() === 'labor').length },
            { id: 'equipment', label: 'Equipment', count: products.filter(p => p.type.toLowerCase() === 'equipment').length },
            { id: 'service', label: 'Service', count: products.filter(p => p.type.toLowerCase() === 'service').length },
            { id: 'subcontractor', label: 'Subcontractor', count: products.filter(p => p.type.toLowerCase() === 'subcontractor').length }
          ]}
          activeItemId={activeCategory}
          onItemClick={setActiveCategory}
        />
        
        {menuOpen && (
          <div className="absolute right-4 top-24 w-[220px] bg-[#232632] rounded-lg z-50 p-2.5 flex flex-col min-w-[180px] shadow-lg">
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
          </div>
        )}
        
        {filteredProducts && filteredProducts.length > 0 ? (
          <div>
            <table className="w-full table-fixed">
              <TableHeader 
                priceSort={priceSort}
                onPriceSort={() => setPriceSort(priceSort === 'asc' ? 'desc' : 'asc')}
              />
              <tbody className="divide-y divide-gray-800">
                {filteredProducts.map((product: Product) => (
                  <tr key={product.id} className="hover:bg-[#232632] cursor-pointer transition-colors">
                    <td className="pl-4 pr-4 py-4 w-[20%] whitespace-nowrap text-sm font-semibold text-white/80" data-testid="product-name">{product.name}</td>
                    <td className="pl-4 pr-4 py-4 w-[40%] whitespace-nowrap text-sm text-gray-300">{product.description}</td>
                    <td className="py-4 pr-3 whitespace-nowrap text-sm text-white/80 text-right">{formatCurrency(product.price)}</td>
                    <td className="py-4 pl-2 w-[120px] whitespace-nowrap text-sm text-gray-300 text-left">
                      <span className="inline-block bg-[#232632] text-[#A3A6AE] rounded-lg px-2 py-0.5 text-xs font-normal">
                        {product.unit}
                      </span>
                    </td>
                    <td className="py-4 pr-3 w-[120px] whitespace-nowrap text-sm text-center">
                      <span className="inline-block bg-[#232F5B] text-[#3B82F6] rounded-lg px-3 py-0.5 text-xs font-medium">
                        {product.type === 'subcontractor' ? 'Sub' : product.type.charAt(0).toUpperCase() + product.type.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 bg-gray-900 rounded-lg">
            {searchTerm ? 'No products match your search.' : 'No products found. Add some products to get started.'}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
