import React, { useState, useEffect } from 'react';
import { X, Copy, TrendingUp, DollarSign, AlertCircle, Check, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../utils/format';

interface ServiceOption {
  id: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  service_id: string;
  organization_id?: string;
  material_quality?: string;
  warranty_months?: number;
  estimated_hours?: number;
  attributes?: Record<string, any>;
  skill_level?: string;
  is_template?: boolean;
  bundle_discount_percentage?: number;
}

interface CustomizeServiceOptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceOption: ServiceOption | null;
  organizationId: string;
  onSuccess?: () => void;
}

export const CustomizeServiceOptionModal: React.FC<CustomizeServiceOptionModalProps> = ({
  isOpen,
  onClose,
  serviceOption,
  organizationId,
  onSuccess
}) => {
  const [bundleDiscount, setBundleDiscount] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [existingCustom, setExistingCustom] = useState<ServiceOption | null>(null);
  const [basePrice, setBasePrice] = useState<number>(0);

  useEffect(() => {
    if (serviceOption && isOpen) {
      console.log('CustomizeServiceOptionModal opened with:', {
        serviceOption,
        organizationId
      });
      
      // Check if there's already a custom version
      checkExistingCustomization();
      
      // Calculate base price from line items
      calculateBasePrice();
      
      // Set initial discount value
      setBundleDiscount((serviceOption.bundle_discount_percentage || 0).toString());
      setError(null);
      setShowSuccess(false);
    }
  }, [serviceOption, isOpen]);

  const checkExistingCustomization = async () => {
    if (!serviceOption || !organizationId) return;

    try {
      console.log('Checking for existing customization with:', {
        organization_id: organizationId,
        name: serviceOption.name,
        service_id: serviceOption.service_id
      });
      
      // The constraint is likely on (name, service_id, organization_id)
      // So we need to check for exact match on all three
      const { data, error } = await supabase
        .from('service_options')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('name', serviceOption.name)
        .eq('service_id', serviceOption.service_id)
        .maybeSingle(); // Use maybeSingle instead of single to avoid error if no match

      if (error) {
        console.error('Error in checkExistingCustomization query:', error);
      }

      if (data) {
        console.log('Found existing customization:', data);
        setExistingCustom(data);
        setBundleDiscount((data.bundle_discount_percentage || 0).toString());
      } else {
        console.log('No existing customization found in initial check');
        
        // Let's also check all options for this org and service
        const { data: allOptions } = await supabase
          .from('service_options')
          .select('id, name, service_id, organization_id')
          .eq('organization_id', organizationId)
          .eq('service_id', serviceOption.service_id);
        
        console.log('All options for this service and org:', allOptions);
      }
    } catch (err) {
      console.error('Error checking existing customization:', err);
      // No existing custom version - that's ok
    }
  };

  const calculateBasePrice = async () => {
    if (!serviceOption) return;

    try {
      // Get the line items for this service option
      const { data, error } = await supabase
        .from('service_option_items')
        .select(`
          quantity,
          line_item:line_items!inner(
            id,
            price
          )
        `)
        .eq('service_option_id', serviceOption.id);

      if (error) {
        console.error('Error fetching line items:', error);
        return;
      }

      // Calculate total base price
      const total = (data || []).reduce((sum, item) => {
        return sum + (item.line_item.price * item.quantity);
      }, 0);

      setBasePrice(total);
    } catch (err) {
      console.error('Error calculating base price:', err);
    }
  };

  const handleSave = async () => {
    if (!serviceOption || !organizationId) return;

    const discount = parseFloat(bundleDiscount);

    if (isNaN(discount) || discount < 0 || discount > 100) {
      setError('Please enter a valid discount percentage (0-100)');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // If this service option already belongs to this organization, just update it
      if (serviceOption.organization_id === organizationId || existingCustom) {
        const idToUpdate = existingCustom?.id || serviceOption.id;
        console.log('Service already belongs to org or custom exists, updating:', idToUpdate);
        
        const { error: updateError } = await supabase
          .from('service_options')
          .update({
            bundle_discount_percentage: discount,
            updated_at: new Date().toISOString()
          })
          .eq('id', idToUpdate);

        if (updateError) throw updateError;
        
        setShowSuccess(true);
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1500);
        return;
      } else {
        // Create new custom version by copying only the database fields
        // IMPORTANT: We need to make this distinct from the shared version
        // The constraint might be on (name, service_id) without considering organization_id
        const customServiceOption = {
          name: serviceOption.name, // Keep the same name for consistency
          description: serviceOption.description,
          service_id: serviceOption.service_id,
          organization_id: organizationId,
          bundle_discount_percentage: discount,
          unit: serviceOption.unit,
          is_template: true, // Keep as template so it shows up in the list
          attributes: serviceOption.attributes || {},
          material_quality: serviceOption.material_quality,
          warranty_months: serviceOption.warranty_months,
          estimated_hours: serviceOption.estimated_hours,
          skill_level: serviceOption.skill_level,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        console.log('Attempting to insert custom service option:', customServiceOption);
        
        // First check if a custom version already exists for this organization
        const { data: existingCustom } = await supabase
          .from('service_options')
          .select('*')
          .eq('name', serviceOption.name)
          .eq('service_id', serviceOption.service_id)
          .eq('organization_id', organizationId);
        
        console.log('Checking for existing custom version:', existingCustom);
        
        if (existingCustom && existingCustom.length > 0) {
          // Custom version already exists, just update the price
          console.log('Updating existing custom option');
          
          const { error: updateError } = await supabase
            .from('service_options')
            .update({ 
              bundle_discount_percentage: discount, 
              updated_at: new Date().toISOString() 
            })
            .eq('id', existingCustom[0].id);
          
          if (updateError) throw updateError;
          
          setShowSuccess(true);
          setTimeout(() => {
            onSuccess?.();
            onClose();
          }, 1500);
          return;
        }
        
        // No existing option, safe to create
        const { data: insertedOption, error: insertError } = await supabase
          .from('service_options')
          .insert(customServiceOption)
          .select()
          .single();
        
        if (insertError) throw insertError;

        // Also copy the service_option_items relationships
        const { data: items, error: itemsError } = await supabase
          .from('service_option_items')
          .select('*')
          .eq('service_option_id', serviceOption.id);

        if (itemsError) throw itemsError;

        if (items && items.length > 0 && insertedOption) {
          // Copy the line items using the newly created option ID
          const newItems = items.map(item => ({
            service_option_id: insertedOption.id,
            line_item_id: item.line_item_id,
            quantity: item.quantity,
            is_optional: item.is_optional,
            display_order: item.display_order
          }));

          const { error: itemsInsertError } = await supabase
            .from('service_option_items')
            .insert(newItems);

          if (itemsInsertError) throw itemsInsertError;
        }
      }

      setShowSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error saving custom pricing:', err);
      setError('Failed to save custom pricing. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const discount = parseFloat(bundleDiscount) || 0;
  const discountedPrice = basePrice * (1 - discount / 100);
  const savedAmount = basePrice - discountedPrice;

  if (!isOpen || !serviceOption) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-black bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block w-full max-w-lg px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-[#1A1A1A] rounded-lg shadow-xl sm:my-8 sm:align-middle sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#336699]/10 rounded-lg">
                <Package className="w-5 h-5 text-[#336699]" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                {existingCustom ? 'Update Service Bundle Discount' : 'Set Service Bundle Discount'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Service Option Info */}
          <div className="mb-6 p-4 bg-[#252525] rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-white">{serviceOption.name}</h4>
                {serviceOption.description && (
                  <p className="text-sm text-gray-400 mt-1">{serviceOption.description}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  {serviceOption.material_quality && (
                    <span className="capitalize">{serviceOption.material_quality} Quality</span>
                  )}
                  {serviceOption.warranty_months && (
                    <span>{serviceOption.warranty_months}mo Warranty</span>
                  )}
                  {serviceOption.estimated_hours && (
                    <span>{serviceOption.estimated_hours}h Labor</span>
                  )}
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="text-sm text-gray-400">Base Price</p>
                <p className="text-lg font-semibold text-white">
                  {formatCurrency(basePrice)}/{serviceOption.unit}
                </p>
              </div>
            </div>
          </div>

          {/* Custom Pricing Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Bundle Discount Percentage
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={bundleDiscount}
                  onChange={(e) => setBundleDiscount(e.target.value)}
                  className="block w-full pl-4 pr-10 py-2 bg-[#252525] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#336699] focus:border-transparent"
                  placeholder="0"
                  step="1"
                  min="0"
                  max="100"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">%</span>
                </div>
              </div>
              
              {/* Discount Result Indicator */}
              {discount > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Base Price:</span>
                    <span className="text-white">{formatCurrency(basePrice)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Discount ({discount}%):</span>
                    <span className="text-emerald-400">-{formatCurrency(savedAmount)}</span>
                  </div>
                  <div className="h-px bg-[#333333]"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-300">Customer Price:</span>
                    <span className="text-lg font-semibold text-white">{formatCurrency(discountedPrice)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-[#336699]/10 rounded-lg border border-[#336699]/30">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-[#336699] flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-300">
                <p className="font-medium text-white mb-1">How Bundle Discounts Work</p>
                <ul className="space-y-1">
                  <li>• Discount applies to the total of all line items</li>
                  <li>• Base prices remain unchanged for transparency</li>
                  <li>• Your discount will be shown on estimates</li>
                  <li>• Perfect for competitive pricing or promotions</li>
                  <li>• Can be updated or removed anytime</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {showSuccess && (
            <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-400" />
                <p className="text-sm text-emerald-400">
                  Service bundle discount saved successfully!
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-300 bg-[#252525] rounded-lg hover:bg-[#333333] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || showSuccess}
              className="flex-1 px-4 py-2 text-black bg-[#F59E0B] rounded-lg hover:bg-[#D97706] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? 'Saving...' : existingCustom ? 'Update Bundle Discount' : 'Save Bundle Discount'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};