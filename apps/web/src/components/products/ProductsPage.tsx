import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MoreVertical, ChevronDown, ChevronRight, Plus, Search, Filter, BarChart3, Upload, Download, LayoutGrid, List, Package, Wrench, Tool, RefreshCw, Search as SearchIcon, Box, Truck, Users } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { useAuth } from '../../contexts/AuthContext';
import { ProductService, Product } from '../../services/ProductService';
import { PageHeader } from '../common/PageHeader';
import { PageHeaderBar } from '../common/PageHeaderBar';
import { NewButton } from '../common/NewButton';
import { CreateProductDrawer } from './CreateProductDrawer';
import { EditProductDrawer } from './EditProductDrawer';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';
import { ExpandableProductRow } from './ExpandableProductRow';
import { GenerateVariantsModal } from './GenerateVariantsModal';
import { OrganizationContext } from '../layouts/DashboardLayout';
import TabMenu from '../common/TabMenu';
import { SERVICE_TYPES, getServiceTypeLabel, getServiceTypeIcon } from '../../constants/serviceTypes';

interface ProductsPageProps {
  editingProduct: Product | 'new' | null;
  setEditingProduct: (product: Product | 'new' | null) => void;
}

interface ProductsByIndustry {
  [industryId: string]: {
    industryName: string;
    products: Product[];
    productCount: number;
    totalValue: number;
    serviceTypes: {
      [serviceType: string]: {
        products: Product[];
        count: number;
      };
    };
  };
}

export const ProductsPage: React.FC<ProductsPageProps> = ({ editingProduct, setEditingProduct }) => {
  const { user } = useAuth();
  const { selectedOrg } = useContext(OrganizationContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [productsByIndustry, setProductsByIndustry] = useState<ProductsByIndustry>({});
  const [expandedIndustries, setExpandedIndustries] = useState<Set<string>>(new Set());
  const [expandedServiceTypes, setExpandedServiceTypes] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [editingProductData, setEditingProductData] = useState<Product | null>(null);
  const [preSelectedItemIds, setPreSelectedItemIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<Set<string>>(new Set());
  const [variantModalProduct, setVariantModalProduct] = useState<Product | null>(null);

  // Handle createFrom parameter for creating products from selected items
  useEffect(() => {
    const createFromParam = searchParams.get('createFrom');
    if (createFromParam) {
      const itemIds = createFromParam.split(',').filter(id => id.trim());
      if (itemIds.length > 0) {
        setShowCreateDrawer(true);
        setPreSelectedItemIds(itemIds);
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('createFrom');
        setSearchParams(newParams, { replace: true });
      }
    }
  }, [searchParams, setSearchParams]);

  const loadProducts = async () => {
    if (!selectedOrg?.id) return;
    
    try {
      setIsLoading(true);
      const data = await ProductService.list(selectedOrg.id);
      setProducts(data);
      
      // Group products by industry and service type
      const grouped: ProductsByIndustry = {};
      
      data.forEach(product => {
        if (!product.parent_product_id) { // Only count parent products
          const industryId = product.industry_id || 'uncategorized';
          const industryName = product.industry_name || 'Uncategorized';
          const serviceType = product.service_type || 'service_call';
          
          if (!grouped[industryId]) {
            grouped[industryId] = {
              industryName,
              products: [],
              productCount: 0,
              totalValue: 0,
              serviceTypes: {}
            };
          }
          
          if (!grouped[industryId].serviceTypes[serviceType]) {
            grouped[industryId].serviceTypes[serviceType] = {
              products: [],
              count: 0
            };
          }
          
          grouped[industryId].products.push(product);
          grouped[industryId].productCount++;
          grouped[industryId].totalValue += product.price || 0;
          grouped[industryId].serviceTypes[serviceType].products.push(product);
          grouped[industryId].serviceTypes[serviceType].count++;
        }
      });
      
      setProductsByIndustry(grouped);
      
      // Expand all industries by default
      setExpandedIndustries(new Set(Object.keys(grouped)));
      
      // Expand key service types by default
      const defaultExpandedServiceTypes = new Set<string>();
      Object.keys(grouped).forEach(industryId => {
        ['complete_project', 'service_call'].forEach(serviceType => {
          if (grouped[industryId].serviceTypes[serviceType]) {
            defaultExpandedServiceTypes.add(`${industryId}-${serviceType}`);
          }
        });
      });
      setExpandedServiceTypes(defaultExpandedServiceTypes);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [selectedOrg?.id]);

  const toggleIndustry = (industryId: string) => {
    const newExpanded = new Set(expandedIndustries);
    if (newExpanded.has(industryId)) {
      newExpanded.delete(industryId);
    } else {
      newExpanded.add(industryId);
    }
    setExpandedIndustries(newExpanded);
  };

  const toggleServiceType = (industryId: string, serviceType: string) => {
    const key = `${industryId}-${serviceType}`;
    const newExpanded = new Set(expandedServiceTypes);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedServiceTypes(newExpanded);
  };

  const handleEdit = (product: Product) => {
    setEditingProductData(product);
    setShowEditDrawer(true);
  };

  const handleDuplicate = async (product: Product) => {
    try {
      const duplicated = await ProductService.create({
        ...product,
        name: `${product.name} (Copy)`,
        organization_id: selectedOrg!.id
      });
      await loadProducts();
    } catch (error) {
      console.error('Error duplicating product:', error);
    }
  };

  const handleDelete = (product: Product) => {
    setDeletingProduct(product);
  };

  const handleGenerateVariants = (product: Product) => {
    setVariantModalProduct(product);
  };

  const confirmDelete = async () => {
    if (!deletingProduct || !selectedOrg) return;
    
    try {
      await ProductService.delete(deletingProduct.id, selectedOrg.id);
      await loadProducts();
      setDeletingProduct(null);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleSelectForComparison = (product: Product) => {
    const newSelected = new Set(selectedForComparison);
    if (newSelected.has(product.id)) {
      newSelected.delete(product.id);
    } else {
      newSelected.add(product.id);
    }
    setSelectedForComparison(newSelected);
  };

  const getVariants = (parentId: string): Product[] => {
    return products.filter(p => p.parent_product_id === parentId)
      .sort((a, b) => {
        const tierOrder = { basic: 1, standard: 2, premium: 3 };
        return (tierOrder[a.quality_tier as keyof typeof tierOrder] || 0) - 
               (tierOrder[b.quality_tier as keyof typeof tierOrder] || 0);
      });
  };

  const filteredProducts = (industryProducts: Product[]) => {
    if (!searchTerm) return industryProducts;
    
    const lowerSearch = searchTerm.toLowerCase();
    return industryProducts.filter(product => 
      product.name.toLowerCase().includes(lowerSearch) ||
      product.description?.toLowerCase().includes(lowerSearch) ||
      product.category?.toLowerCase().includes(lowerSearch)
    );
  };

  const pageHeaderButtons = (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setCompareMode(!compareMode)}
        className={`px-4 py-2 rounded-lg transition-colors ${
          compareMode
            ? 'bg-[#336699] text-white'
            : 'bg-[#333333] text-gray-300 hover:bg-[#444444]'
        }`}
        disabled={viewMode === 'grid'}
      >
        <BarChart3 className="w-4 h-4 mr-2 inline" />
        Compare
      </button>
      
      <div className="flex bg-[#333333] rounded-lg p-1">
        <button
          onClick={() => setViewMode('list')}
          className={`p-2 rounded ${
            viewMode === 'list'
              ? 'bg-[#444444] text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => setViewMode('grid')}
          className={`p-2 rounded ${
            viewMode === 'grid'
              ? 'bg-[#444444] text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
      </div>
      
      <NewButton onClick={() => setShowCreateDrawer(true)} />
    </div>
  );

  return (
    <div className="flex-1 bg-[#0A0A0A]">
      <PageHeader
        title="Services"
        subtitle="Manage your services and pricing"
      />
      
      <PageHeaderBar
        showNew={false}
        showSearch={true}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search services..."
        actions={
          <div className="flex items-center gap-2">
            {selectedForComparison.size > 0 && (
              <span className="text-sm text-gray-400 mr-2">
                {selectedForComparison.size} selected
              </span>
            )}
            
            <button
              onClick={() => {
                if (expandedIndustries.size === 0) {
                  // Expand all
                  const allIndustries = new Set(Object.keys(productsByIndustry));
                  setExpandedIndustries(allIndustries);
                } else {
                  // Collapse all
                  setExpandedIndustries(new Set());
                }
              }}
              className="bg-[#1E1E1E] border border-[#333333] px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors flex items-center gap-2"
            >
              {expandedIndustries.size === 0 ? (
                <>
                  <ChevronRight className="w-4 h-4" />
                  Expand All
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Collapse All
                </>
              )}
            </button>
            
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              className="bg-[#1E1E1E] border border-[#333333] p-2 text-white hover:bg-[#333333] transition-colors"
            >
              {viewMode === 'list' ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
            </button>
            
            <button
              onClick={handleExport}
              className="bg-[#1E1E1E] border border-[#333333] p-2 text-white hover:bg-[#333333] transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            
            <NewButton
              label="New Service"
              onClick={() => setShowCreateDrawer(true)}
            />
          </div>
        }
      />

      {/* Content */}
      <div className="border-t border-[#333333]">

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">Loading services...</div>
          </div>
        ) : viewMode === 'list' ? (
          /* List View - Grouped by Industry with Accordion */
          <div>
            {Object.entries(productsByIndustry).map(([industryId, industryData]) => {
              const isExpanded = expandedIndustries.has(industryId);
              const filtered = filteredProducts(industryData.products);
              if (filtered.length === 0 && searchTerm) return null;
              
              return (
                <div key={industryId} className="border-b border-[#333333] last:border-b-0">
                  {/* Industry Header - Clickable */}
                  <button
                    onClick={() => toggleIndustry(industryId)}
                    className="w-full px-6 py-4 bg-[#1A1A1A] hover:bg-[#222222] transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <ChevronRight 
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                        {industryData.industryName}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {filtered.length} services
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      {isExpanded && (
                        <label className="flex items-center gap-2 text-sm text-gray-400 mr-4">
                          <input
                            type="checkbox"
                            checked={filtered.every(product => selectedForComparison.has(product.id))}
                            onChange={(e) => {
                              e.stopPropagation();
                              if (e.target.checked) {
                                // Select all products in this industry
                                const newSelected = new Set(selectedForComparison);
                                filtered.forEach(product => newSelected.add(product.id));
                                setSelectedForComparison(newSelected);
                              } else {
                                // Deselect all products in this industry
                                const newSelected = new Set(selectedForComparison);
                                filtered.forEach(product => newSelected.delete(product.id));
                                setSelectedForComparison(newSelected);
                              }
                            }}
                            className="w-4 h-4 bg-[#1E1E1E] border-[#333333] text-[#336699] focus:ring-[#336699]"
                            onClick={(e) => e.stopPropagation()}
                          />
                          Select all
                        </label>
                      )}
                      <div className="text-sm text-gray-400 group-hover:text-gray-300">
                        {isExpanded ? 'Click to collapse' : 'Click to expand'}
                      </div>
                    </div>
                  </button>

                  
                  {/* Services for this Industry - Only show when expanded */}
                  {isExpanded && (
                    <div className="divide-y divide-[#333333]">
                      {filtered.map((product) => (
                        <div
                          key={product.id}
                          className="px-6 py-4 hover:bg-[#1E1E1E] transition-colors flex items-center gap-4"
                        >
                          <input
                            type="checkbox"
                            checked={selectedForComparison.has(product.id)}
                            onChange={() => handleSelectForComparison(product.id)}
                            className="w-4 h-4 bg-[#1E1E1E] border-[#333333] text-[#336699] focus:ring-[#336699]"
                          />
                          
                          <div className="flex items-center gap-3 flex-1">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <h3 className="text-white font-medium">{product.name}</h3>
                                {product.service_type && (
                                  <span className={`text-xs px-2 py-0.5 rounded ${
                                    product.service_type === 'service_call' ? 'bg-blue-400/20 text-blue-400' :
                                    product.service_type === 'maintenance' ? 'bg-green-400/20 text-green-400' :
                                    product.service_type === 'complete_project' ? 'bg-purple-400/20 text-purple-400' :
                                    'bg-orange-400/20 text-orange-400'
                                  }`}>
                                    {getServiceTypeLabel(product.service_type)}
                                  </span>
                                )}
                              </div>
                              {product.description && (
                                <p className="text-gray-400 text-sm mt-1">{product.description}</p>
                              )}
                            </div>
                            
                            <div className="text-right">
                              <div className="text-white font-medium">
                                {formatCurrency(product.price)}
                              </div>
                              <div className="text-gray-400 text-sm">{product.unit}</div>
                            </div>
                            
                            <button
                              onClick={() => handleEdit(product)}
                              className="p-2 hover:bg-[#333333] rounded transition-colors"
                            >
                              <MoreVertical className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* Compact Grid View - Grouped by Industry with Accordion */
          <div className="">
            {Object.entries(productsByIndustry).map(([industryId, industryData]) => {
              const isExpanded = expandedIndustries.has(industryId);
              const filtered = filteredProducts(industryData.products);
              if (filtered.length === 0 && searchTerm) return null;
              
              return (
                <div key={industryId} className="border-b border-[#333333] last:border-b-0">
                  {/* Industry Header - Clickable */}
                  <button
                    onClick={() => toggleIndustry(industryId)}
                    className="w-full px-6 py-4 bg-[#1A1A1A] hover:bg-[#222222] transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <ChevronRight 
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                        {industryData.industryName}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {filtered.length} services
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      {isExpanded && (
                        <label className="flex items-center gap-2 text-sm text-gray-400 mr-4">
                          <input
                            type="checkbox"
                            checked={filtered.every(product => selectedForComparison.has(product.id))}
                            onChange={(e) => {
                              e.stopPropagation();
                              if (e.target.checked) {
                                // Select all products in this industry
                                const newSelected = new Set(selectedForComparison);
                                filtered.forEach(product => newSelected.add(product.id));
                                setSelectedForComparison(newSelected);
                              } else {
                                // Deselect all products in this industry
                                const newSelected = new Set(selectedForComparison);
                                filtered.forEach(product => newSelected.delete(product.id));
                                setSelectedForComparison(newSelected);
                              }
                            }}
                            className="w-4 h-4 bg-[#1E1E1E] border-[#333333] text-[#336699] focus:ring-[#336699]"
                            onClick={(e) => e.stopPropagation()}
                          />
                          Select all
                        </label>
                      )}
                      <div className="text-sm text-gray-400 group-hover:text-gray-300">
                        {isExpanded ? 'Click to collapse' : 'Click to expand'}
                      </div>
                    </div>
                  </button>
                  
                  {/* Service Grid for this Industry - Only show when expanded */}
                  {isExpanded && (
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {filtered.map((product) => (
                          <div
                            key={product.id}
                            className="bg-[#1E1E1E] border border-[#333333] p-3 hover:border-[#336699] transition-colors cursor-pointer"
                            onClick={() => handleEdit(product)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                product.service_type === 'service_call' ? 'bg-blue-400/20 text-blue-400' :
                                product.service_type === 'maintenance' ? 'bg-green-400/20 text-green-400' :
                                product.service_type === 'complete_project' ? 'bg-purple-400/20 text-purple-400' :
                                'bg-orange-400/20 text-orange-400'
                              }`}>
                                {getServiceTypeLabel(product.service_type)}
                              </span>
                              <input
                                type="checkbox"
                                checked={selectedForComparison.has(product.id)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleSelectForComparison(product.id);
                                }}
                                className="w-3 h-3 bg-[#1E1E1E] border-[#333333] text-[#336699] focus:ring-[#336699]"
                              />
                            </div>
                            
                            <h3 className="text-white font-medium text-sm line-clamp-2 mb-1">{product.name}</h3>
                            
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-[#336699] font-medium">
                                {formatCurrency(product.price)}
                              </span>
                              <span className="text-gray-400">{product.unit}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        </div>
      </div>

      {/* Drawers */}
      <CreateProductDrawer
        isOpen={showCreateDrawer}
        onClose={() => {
          setShowCreateDrawer(false);
          setPreSelectedItemIds([]);
        }}
        onSuccess={loadProducts}
        preSelectedItemIds={preSelectedItemIds}
      />

      {editingProductData && (
        <EditProductDrawer
          isOpen={showEditDrawer}
          onClose={() => {
            setShowEditDrawer(false);
            setEditingProductData(null);
          }}
          onSuccess={loadProducts}
          product={editingProductData}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <DeleteConfirmationModal
          isOpen={!!deletingProduct}
          onClose={() => setDeletingProduct(null)}
          onConfirm={confirmDelete}
          title="Delete Product"
          message={`Are you sure you want to delete "${deletingProduct.name}"? This action cannot be undone.`}
        />
      )}

      {/* Generate Variants Modal */}
      <GenerateVariantsModal
        isOpen={!!variantModalProduct}
        onClose={() => setVariantModalProduct(null)}
        product={variantModalProduct}
        onSuccess={loadProducts}
      />
    </div>
  );
};