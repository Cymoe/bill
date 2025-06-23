import React, { useState, useEffect, useContext } from 'react';
import { X, Plus, Minus, Search, Package, DollarSign, Clock, Shield } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { ServiceCatalogService, Service, ServiceOption } from '../../services/ServiceCatalogService';
import { LineItemService } from '../../services/LineItemService';
import { OrganizationContext } from '../layouts/DashboardLayout';
import { Modal } from '../common/Modal';

interface LineItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  cost_code?: string;
  cost_code_name?: string;
}

interface SelectedLineItem extends LineItem {
  quantity: number;
}

interface CreateServiceOptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  service: Service;
}

export const CreateServiceOptionModal: React.FC<CreateServiceOptionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  service
}) => {
  const { selectedOrg } = useContext(OrganizationContext);
  
  // Form fields
  const [optionName, setOptionName] = useState('');
  const [description, setDescription] = useState('');
  const [finalPrice, setFinalPrice] = useState<string>('');
  const [unit, setUnit] = useState('each');
  const [estimatedHours, setEstimatedHours] = useState<string>('');
  const [materialQuality, setMaterialQuality] = useState<'economy' | 'standard' | 'premium' | 'luxury'>('standard');
  const [warrantyMonths, setWarrantyMonths] = useState<string>('');
  
  // Line items
  const [availableLineItems, setAvailableLineItems] = useState<LineItem[]>([]);
  const [filteredLineItems, setFilteredLineItems] = useState<LineItem[]>([]);
  const [selectedLineItems, setSelectedLineItems] = useState<SelectedLineItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Calculated values
  const calculatedTotal = selectedLineItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const hasCustomPrice = finalPrice !== '' && parseFloat(finalPrice) !== calculatedTotal;

  useEffect(() => {
    if (isOpen && selectedOrg?.id) {
      loadLineItems();
    }
  }, [isOpen, selectedOrg?.id]);

  useEffect(() => {
    // Filter line items based on search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      setFilteredLineItems(
        availableLineItems.filter(item =>
          item.name.toLowerCase().includes(lower) ||
          item.description?.toLowerCase().includes(lower) ||
          item.cost_code?.toLowerCase().includes(lower)
        )
      );
    } else {
      setFilteredLineItems(availableLineItems);
    }
  }, [searchTerm, availableLineItems]);

  const loadLineItems = async () => {
    if (!selectedOrg?.id) return;
    
    setIsLoadingItems(true);
    try {
      const items = await LineItemService.list(selectedOrg.id);
      setAvailableLineItems(items || []);
      setFilteredLineItems(items || []);
    } catch (error) {
      console.error('Error loading line items:', error);
    } finally {
      setIsLoadingItems(false);
    }
  };

  const addLineItem = (item: LineItem) => {
    const existing = selectedLineItems.find(li => li.id === item.id);
    if (existing) {
      // Increase quantity
      setSelectedLineItems(prev =>
        prev.map(li => li.id === item.id ? { ...li, quantity: li.quantity + 1 } : li)
      );
    } else {
      // Add new item
      setSelectedLineItems(prev => [...prev, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeLineItem(itemId);
    } else {
      setSelectedLineItems(prev =>
        prev.map(li => li.id === itemId ? { ...li, quantity } : li)
      );
    }
  };

  const removeLineItem = (itemId: string) => {
    setSelectedLineItems(prev => prev.filter(li => li.id !== itemId));
  };

  const handleSubmit = async () => {
    if (!selectedOrg?.id || !optionName || !service.id) return;

    setIsSaving(true);
    try {
      // Create the service option
      const option: Omit<ServiceOption, 'id' | 'created_at' | 'updated_at'> = {
        service_id: service.id,
        organization_id: selectedOrg.id,
        name: optionName,
        description,
        price: parseFloat(finalPrice || calculatedTotal.toString()),
        unit,
        estimated_hours: estimatedHours ? parseFloat(estimatedHours) : undefined,
        materials_list: selectedLineItems.map(item => 
          `${item.name} (${item.quantity} ${item.unit})`
        ),
        material_quality: materialQuality,
        warranty_months: warrantyMonths ? parseInt(warrantyMonths) : undefined,
        is_active: true,
        is_popular: false,
        display_order: 0
      };

      await ServiceCatalogService.createServiceOption(option);
      
      // Reset form
      setOptionName('');
      setDescription('');
      setFinalPrice('');
      setUnit('each');
      setEstimatedHours('');
      setMaterialQuality('standard');
      setWarrantyMonths('');
      setSelectedLineItems([]);
      setSearchTerm('');
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating service option:', error);
      alert('Failed to create service option');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Option to ${service.name}`}
      size="xl"
    >
      <div className="flex flex-col h-[80vh]">
        {/* Header Section */}
        <div className="px-6 py-4 border-b border-[#333333]">
          <p className="text-sm text-gray-400">
            Create a new service option by bundling line items together
          </p>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Column - Form */}
          <div className="w-1/2 border-r border-[#333333] p-6 overflow-y-auto">
            <h3 className="text-white font-medium mb-4">Option Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Option Name*</label>
                <input
                  type="text"
                  value={optionName}
                  onChange={(e) => setOptionName(e.target.value)}
                  placeholder="e.g., Standard Installation"
                  className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#333333] text-white placeholder-gray-500 focus:outline-none focus:border-[#336699]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what's included..."
                  rows={3}
                  className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#333333] text-white placeholder-gray-500 focus:outline-none focus:border-[#336699]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Final Price*</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={finalPrice}
                      onChange={(e) => setFinalPrice(e.target.value)}
                      placeholder={calculatedTotal.toFixed(2)}
                      className="w-full pl-10 pr-3 py-2 bg-[#1E1E1E] border border-[#333333] text-white placeholder-gray-500 focus:outline-none focus:border-[#336699]"
                    />
                  </div>
                  {hasCustomPrice && (
                    <p className="text-xs text-amber-500 mt-1">
                      Custom price (calculated: {formatCurrency(calculatedTotal)})
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Unit*</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#333333] text-white focus:outline-none focus:border-[#336699]"
                  >
                    <option value="each">Each</option>
                    <option value="sqft">Square Foot</option>
                    <option value="lf">Linear Foot</option>
                    <option value="hour">Hour</option>
                    <option value="day">Day</option>
                    <option value="lot">Lot</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    <Clock className="inline w-3 h-3 mr-1" />
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#333333] text-white placeholder-gray-500 focus:outline-none focus:border-[#336699]"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    <Shield className="inline w-3 h-3 mr-1" />
                    Warranty (months)
                  </label>
                  <input
                    type="number"
                    value={warrantyMonths}
                    onChange={(e) => setWarrantyMonths(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#333333] text-white placeholder-gray-500 focus:outline-none focus:border-[#336699]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Material Quality</label>
                <select
                  value={materialQuality}
                  onChange={(e) => setMaterialQuality(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#333333] text-white focus:outline-none focus:border-[#336699]"
                >
                  <option value="economy">Economy</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>
            </div>

            {/* Selected Line Items */}
            {selectedLineItems.length > 0 && (
              <div className="mt-6">
                <h4 className="text-white font-medium mb-3">Included Items</h4>
                <div className="space-y-2">
                  {selectedLineItems.map((item) => (
                    <div key={item.id} className="bg-[#1E1E1E] border border-[#333333] p-3 rounded">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-white text-sm font-medium">{item.name}</div>
                          <div className="text-gray-400 text-xs">
                            {formatCurrency(item.price)} per {item.unit}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-[#333333] rounded"
                          >
                            <Minus className="w-3 h-3 text-gray-400" />
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                            className="w-12 text-center bg-[#0A0A0A] border border-[#333333] text-white text-sm"
                          />
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-[#333333] rounded"
                          >
                            <Plus className="w-3 h-3 text-gray-400" />
                          </button>
                          <button
                            onClick={() => removeLineItem(item.id)}
                            className="p-1 hover:bg-[#333333] rounded ml-2"
                          >
                            <X className="w-3 h-3 text-red-400" />
                          </button>
                        </div>
                      </div>
                      <div className="text-right text-xs text-gray-500 mt-1">
                        Subtotal: {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Line Items Selection */}
          <div className="w-1/2 p-6 overflow-y-auto">
            <h3 className="text-white font-medium mb-4">Add Line Items</h3>
            
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search line items..."
                className="w-full pl-10 pr-4 py-2 bg-[#1E1E1E] border border-[#333333] text-white placeholder-gray-500 focus:outline-none focus:border-[#336699]"
              />
            </div>

            {/* Line Items List */}
            {isLoadingItems ? (
              <div className="text-center text-gray-400 py-8">Loading items...</div>
            ) : filteredLineItems.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No line items found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredLineItems.map((item) => {
                  const isSelected = selectedLineItems.some(li => li.id === item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => addLineItem(item)}
                      className={`p-3 border rounded cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#336699]/20 border-[#336699]'
                          : 'bg-[#1E1E1E] border-[#333333] hover:border-[#444444]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white text-sm font-medium">{item.name}</div>
                          {item.cost_code_name && (
                            <div className="text-gray-500 text-xs">{item.cost_code_name}</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-white text-sm">{formatCurrency(item.price)}</div>
                          <div className="text-gray-400 text-xs">per {item.unit}</div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="text-[#336699] text-xs mt-1">
                          ✓ Added to option
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#333333] bg-[#0A0A0A]">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Total from items: <span className="text-white font-medium">{formatCurrency(calculatedTotal)}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!optionName || isSaving || selectedLineItems.length === 0}
                className="px-4 py-2 bg-[#336699] text-white hover:bg-[#4477aa] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Option
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};