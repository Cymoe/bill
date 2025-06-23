import React, { useState, useEffect, useContext } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { WorkPackService } from '../../services/WorkPackService';
import { ProductService, Product } from '../../services/ProductService';
import { formatCurrency } from '../../utils/format';
import { Search, Plus, Minus, X, Save, Package } from 'lucide-react';
import { OrganizationContext } from '../layouts/DashboardLayout';

interface SelectedProduct extends Product {
  quantity: number;
}

interface CreateWorkPackDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateWorkPackDrawer: React.FC<CreateWorkPackDrawerProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const { selectedOrg } = useContext(OrganizationContext);
  const [workPackName, setWorkPackName] = useState('');
  const [workPackDescription, setWorkPackDescription] = useState('');
  const [tier, setTier] = useState<'basic' | 'standard' | 'premium'>('standard');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && selectedOrg?.id) {
      fetchProducts();
    }
  }, [isOpen, selectedOrg?.id]);

  const fetchProducts = async () => {
    if (!selectedOrg?.id) return;
    
    try {
      setIsLoading(true);
      const data = await ProductService.list(selectedOrg.id);
      // Filter to only show parent products (not variants)
      const parentProducts = data.filter(p => !p.parent_product_id);
      setProducts(parentProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    if (!searchTerm) return true;
    
    const lowerSearch = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(lowerSearch) ||
      product.description?.toLowerCase().includes(lowerSearch) ||
      product.service_type?.toLowerCase().includes(lowerSearch)
    );
  });

  // Group products by service type
  const groupedProducts = filteredProducts.reduce((groups, product) => {
    const serviceType = product.service_type || 'uncategorized';
    if (!groups[serviceType]) {
      groups[serviceType] = [];
    }
    groups[serviceType].push(product);
    return groups;
  }, {} as Record<string, Product[]>);

  const addProduct = (product: Product) => {
    setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) return;
    setSelectedProducts(selectedProducts.map(p =>
      p.id === productId ? { ...p, quantity } : p
    ));
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((sum, product) => sum + (product.price * product.quantity), 0);
  };

  const handleSave = async () => {
    if (!workPackName.trim() || selectedProducts.length === 0 || !selectedOrg) return;

    try {
      setIsSaving(true);

      await WorkPackService.create({
        name: workPackName,
        description: workPackDescription,
        tier,
        base_price: calculateTotal(),
        organization_id: selectedOrg.id,
        is_active: true,
        display_order: 0,
        items: selectedProducts.map((product, index) => ({
          product_id: product.id,
          item_type: 'product' as const,
          quantity: product.quantity,
          display_order: index
        }))
      });

      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error creating work pack:', error);
      alert('Failed to create work pack. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setWorkPackName('');
    setWorkPackDescription('');
    setTier('standard');
    setSelectedProducts([]);
    setSearchTerm('');
    onClose();
  };

  const getServiceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      installation: 'Installation',
      service_call: 'Service Calls',
      repair: 'Repairs',
      maintenance: 'Maintenance',
      inspection: 'Inspections',
      preparation: 'Preparation',
      finishing: 'Finishing',
      material: 'Materials',
      equipment_rental: 'Equipment Rental',
      subcontractor: 'Subcontractor',
      consultation: 'Consultation',
      uncategorized: 'Uncategorized'
    };
    return labels[type] || type;
  };

  return (
    <>
      {/* Backdrop with blur effect */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity z-[9998] ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-[80%] max-w-[1200px] bg-[#121212] shadow-xl transform transition-transform z-[9999] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Compact Header */}
        <div className="bg-[#1E1E1E] border-b border-[#333333] px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <h1 className="text-lg font-semibold">Create Work Pack</h1>
            </div>
            <button
              onClick={handleSave}
              disabled={!workPackName.trim() || selectedProducts.length === 0 || isSaving}
              className="px-4 py-1.5 bg-[#336699] text-white rounded-[4px] hover:bg-[#2A5580] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
            >
              <Save className="w-3 h-3" />
              {isSaving ? 'Creating...' : 'Create Work Pack'}
            </button>
          </div>
        </div>

        {/* Main Content - Compact Layout */}
        <div className="flex h-[calc(100%-60px)]">
          {/* Left Column - Products (50% width) */}
          <div className="w-[50%] border-r border-[#333333] flex flex-col">
            {/* Search */}
            <div className="p-3 border-b border-[#333333]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#333333] border border-[#555555] rounded-[4px] text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#336699]"
                />
              </div>
            </div>

            {/* Products List */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-8 text-gray-400 text-sm">Loading products...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  {searchTerm ? 'No products found' : 'No products available'}
                </div>
              ) : (
                <div>
                  {Object.entries(groupedProducts).map(([serviceType, products]) => (
                    <div key={serviceType}>
                      {/* Service Type Header */}
                      <div className="sticky top-0 bg-[#336699]/20 backdrop-blur-sm border-b border-[#336699]/30 px-3 py-2 z-10">
                        <h4 className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
                          {getServiceTypeLabel(serviceType)} ({products.length})
                        </h4>
                      </div>
                      
                      {/* Products */}
                      <div className="divide-y divide-[#333333]">
                        {products.map(product => (
                          <div
                            key={product.id}
                            className="px-3 py-2 hover:bg-[#1E1E1E] cursor-pointer transition-colors"
                            onClick={() => addProduct(product)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-white truncate">{product.name}</div>
                                {product.description && (
                                  <p className="text-xs text-gray-400 mt-0.5 truncate">{product.description}</p>
                                )}
                              </div>
                              <div className="text-right ml-3 flex-shrink-0">
                                <div className="font-mono text-sm text-white">
                                  {formatCurrency(product.price)}
                                </div>
                                <div className="text-xs text-gray-400">/{product.unit}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Work Pack Details (50% width) */}
          <div className="flex-1 flex flex-col">
            {/* Work Pack Info Section */}
            <div className="p-4 border-b border-[#333333]">
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    value={workPackName}
                    onChange={(e) => setWorkPackName(e.target.value)}
                    placeholder="Work Pack Name *"
                    className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#336699]"
                  />
                </div>
                <div>
                  <textarea
                    value={workPackDescription}
                    onChange={(e) => setWorkPackDescription(e.target.value)}
                    placeholder="Description (optional)"
                    rows={2}
                    className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#336699] resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                    Tier
                  </label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value as 'basic' | 'standard' | 'premium')}
                    className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-sm text-white focus:outline-none focus:border-[#336699]"
                  >
                    <option value="basic">Basic</option>
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Selected Products Section */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Package className="w-4 h-4 text-purple-400" />
                  Selected Products ({selectedProducts.length})
                </h3>
                {selectedProducts.length > 0 && (
                  <button
                    onClick={() => setSelectedProducts([])}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              {selectedProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Click products on the left to add them
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedProducts.map(product => (
                    <div key={product.id} className="flex items-center gap-3 p-2 bg-[#1E1E1E] rounded-[4px]">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white truncate">{product.name}</div>
                        <div className="text-xs text-gray-400">
                          {formatCurrency(product.price)} × {product.quantity} = {formatCurrency(product.price * product.quantity)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(product.id, product.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center bg-[#333333] hover:bg-[#404040] rounded-[2px] transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          value={product.quantity}
                          onChange={(e) => updateQuantity(product.id, Number(e.target.value))}
                          className="w-12 text-center px-1 py-1 bg-[#333333] border border-[#555555] rounded-[2px] text-white text-sm"
                        />
                        <button
                          onClick={() => updateQuantity(product.id, product.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center bg-[#333333] hover:bg-[#404040] rounded-[2px] transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeProduct(product.id)}
                          className="w-6 h-6 flex items-center justify-center text-red-400 hover:bg-red-400/20 rounded-[2px] transition-colors ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pricing Summary - Fixed at bottom */}
            <div className="border-t border-[#333333] p-4 bg-[#1E1E1E]">
              <div className="flex justify-between text-base font-semibold">
                <span className="text-white">Total Base Price</span>
                <span className="font-mono text-white">{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};