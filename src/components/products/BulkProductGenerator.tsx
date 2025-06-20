import React, { useState, useEffect, useContext } from 'react';
import { X, Package, ChevronRight, Check, AlertCircle, Search, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { OrganizationContext } from '../layouts/DashboardLayout';
import { CostCodeProductService, CostCode, GeneratedProduct } from '../../services/CostCodeProductService';
import { formatCurrency } from '../../utils/format';
import { Modal } from '../common/Modal';

interface Industry {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description?: string;
}

interface BulkProductGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preSelectedCostCodes?: string[];
  industryId?: string;
}

export const BulkProductGenerator: React.FC<BulkProductGeneratorProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preSelectedCostCodes = [],
  industryId: defaultIndustryId
}) => {
  const { user } = useAuth();
  const { selectedOrg } = useContext(OrganizationContext);
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1: Cost Code Selection
  const [costCodes, setCostCodes] = useState<CostCode[]>([]);
  const [selectedCostCodes, setSelectedCostCodes] = useState<Set<string>>(new Set(preSelectedCostCodes));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Step 2: Industry & Markup Configuration
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<string>(defaultIndustryId || '');
  const [selectedTier, setSelectedTier] = useState<'budget' | 'standard' | 'premium'>('standard');
  const [useCustomMarkup, setUseCustomMarkup] = useState(false);
  const [customMarkup, setCustomMarkup] = useState('30');
  const [namePrefix, setNamePrefix] = useState('');
  const [nameSuffix, setNameSuffix] = useState('');
  
  // Step 3: Preview & Generation
  const [generatedProducts, setGeneratedProducts] = useState<GeneratedProduct[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  
  // Loading states
  const [isLoadingCostCodes, setIsLoadingCostCodes] = useState(true);
  const [isLoadingIndustries, setIsLoadingIndustries] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadCostCodes();
      loadIndustries();
    }
  }, [isOpen, selectedOrg?.id]);

  const loadCostCodes = async () => {
    if (!selectedOrg?.id) return;
    
    try {
      setIsLoadingCostCodes(true);
      const grouped = await CostCodeProductService.getCostCodesByCategory(selectedOrg.id);
      const allCodes: CostCode[] = [];
      grouped.forEach(codes => allCodes.push(...codes));
      setCostCodes(allCodes);
    } catch (error) {
      console.error('Error loading cost codes:', error);
      setErrors(['Failed to load cost codes']);
    } finally {
      setIsLoadingCostCodes(false);
    }
  };

  const loadIndustries = async () => {
    if (!selectedOrg?.id) return;
    
    try {
      setIsLoadingIndustries(true);
      const { data, error } = await supabase
        .from('organization_industries')
        .select('industry:industries(*)')
        .eq('organization_id', selectedOrg.id);
      
      if (error) throw error;
      
      const industriesList = data?.map(item => item.industry).filter(Boolean) || [];
      setIndustries(industriesList);
      
      if (industriesList.length === 1 && !selectedIndustry) {
        setSelectedIndustry(industriesList[0].id);
      }
    } catch (error) {
      console.error('Error loading industries:', error);
      setErrors(['Failed to load industries']);
    } finally {
      setIsLoadingIndustries(false);
    }
  };

  const filteredCostCodes = costCodes.filter(code => {
    const matchesSearch = !searchTerm || 
      code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (code.description && code.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || code.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(costCodes.map(code => code.category).filter(Boolean)));

  const toggleCostCode = (codeId: string) => {
    const newSelected = new Set(selectedCostCodes);
    if (newSelected.has(codeId)) {
      newSelected.delete(codeId);
    } else {
      newSelected.add(codeId);
    }
    setSelectedCostCodes(newSelected);
  };

  const toggleAllInCategory = (category: string) => {
    const categoryCodeIds = costCodes
      .filter(code => code.category === category)
      .map(code => code.id);
    
    const allSelected = categoryCodeIds.every(id => selectedCostCodes.has(id));
    const newSelected = new Set(selectedCostCodes);
    
    if (allSelected) {
      categoryCodeIds.forEach(id => newSelected.delete(id));
    } else {
      categoryCodeIds.forEach(id => newSelected.add(id));
    }
    
    setSelectedCostCodes(newSelected);
  };

  const handleGeneratePreview = async () => {
    if (!selectedOrg?.id || selectedCostCodes.size === 0 || !selectedIndustry) return;
    
    setIsGenerating(true);
    setErrors([]);
    
    try {
      const result = await CostCodeProductService.generateProductsFromCostCodes({
        cost_code_ids: Array.from(selectedCostCodes),
        industry_id: selectedIndustry,
        organization_id: selectedOrg.id,
        tier: selectedTier,
        custom_markup: useCustomMarkup ? parseFloat(customMarkup) : undefined,
        name_prefix: namePrefix.trim(),
        name_suffix: nameSuffix.trim()
      });
      
      if (result.success) {
        setGeneratedProducts(result.products);
        setCurrentStep(3);
      } else {
        setErrors(result.errors || ['Failed to generate products']);
      }
    } catch (error) {
      console.error('Error generating preview:', error);
      setErrors(['An unexpected error occurred']);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateProducts = async () => {
    if (!user?.id || !selectedOrg?.id || generatedProducts.length === 0) return;
    
    setIsCreating(true);
    setErrors([]);
    
    try {
      const result = await CostCodeProductService.createGeneratedProducts(
        generatedProducts,
        selectedOrg.id,
        user.id
      );
      
      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setErrors(result.errors || ['Failed to create products']);
      }
    } catch (error) {
      console.error('Error creating products:', error);
      setErrors(['An unexpected error occurred']);
    } finally {
      setIsCreating(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        <div className={`flex items-center ${currentStep >= 1 ? 'text-[#fbbf24]' : 'text-gray-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
            ${currentStep >= 1 ? 'border-[#fbbf24] bg-[#fbbf24] text-black' : 'border-gray-500'}`}>
            {currentStep > 1 ? <Check className="w-5 h-5" /> : '1'}
          </div>
          <span className="ml-2 text-sm font-medium">Select Cost Codes</span>
        </div>
        
        <ChevronRight className="w-5 h-5 text-gray-500" />
        
        <div className={`flex items-center ${currentStep >= 2 ? 'text-[#fbbf24]' : 'text-gray-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
            ${currentStep >= 2 ? 'border-[#fbbf24] bg-[#fbbf24] text-black' : 'border-gray-500'}`}>
            {currentStep > 2 ? <Check className="w-5 h-5" /> : '2'}
          </div>
          <span className="ml-2 text-sm font-medium">Configure Markup</span>
        </div>
        
        <ChevronRight className="w-5 h-5 text-gray-500" />
        
        <div className={`flex items-center ${currentStep >= 3 ? 'text-[#fbbf24]' : 'text-gray-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
            ${currentStep >= 3 ? 'border-[#fbbf24] bg-[#fbbf24] text-black' : 'border-gray-500'}`}>
            3
          </div>
          <span className="ml-2 text-sm font-medium">Review & Create</span>
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Search and filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search cost codes..."
            className="w-full pl-10 pr-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Selected count */}
      <div className="text-sm text-gray-400">
        {selectedCostCodes.size} cost codes selected
      </div>

      {/* Cost codes list */}
      <div className="max-h-96 overflow-y-auto space-y-4">
        {isLoadingCostCodes ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#fbbf24]" />
          </div>
        ) : (
          categories
            .filter(category => selectedCategory === 'all' || category === selectedCategory)
            .map(category => {
              const categoryCodes = filteredCostCodes.filter(code => code.category === category);
              if (categoryCodes.length === 0) return null;
              
              const allSelected = categoryCodes.every(code => selectedCostCodes.has(code.id));
              
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between py-2">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase">
                      {category}
                    </h3>
                    <button
                      onClick={() => toggleAllInCategory(category)}
                      className="text-xs text-[#fbbf24] hover:text-[#f59e0b]"
                    >
                      {allSelected ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  
                  {categoryCodes.map(code => (
                    <label
                      key={code.id}
                      className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors
                        ${selectedCostCodes.has(code.id)
                          ? 'bg-[#0f1729] border-[#fbbf24]'
                          : 'bg-[#111] border-[#2a2a2a] hover:border-[#3a3a3a]'}`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCostCodes.has(code.id)}
                        onChange={() => toggleCostCode(code.id)}
                        className="mt-1 mr-3"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-[#fbbf24]">{code.code}</span>
                          <span className="text-white">{code.name}</span>
                        </div>
                        {code.description && (
                          <p className="text-sm text-gray-400 mt-1">{code.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Unit: {code.unit}</span>
                          {code.base_price && (
                            <span>Base: {formatCurrency(code.base_price)}</span>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              );
            })
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onClose}
          className="px-6 py-2 text-gray-400 hover:text-white"
        >
          Cancel
        </button>
        <button
          onClick={() => setCurrentStep(2)}
          disabled={selectedCostCodes.size === 0}
          className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2
            ${selectedCostCodes.size > 0
              ? 'bg-[#fbbf24] text-black hover:bg-[#f59e0b]'
              : 'bg-[#1a1a1a] text-gray-600 cursor-not-allowed'}`}
        >
          Continue
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      {/* Industry Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Industry</label>
        {isLoadingIndustries ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-[#fbbf24]" />
          </div>
        ) : industries.length === 0 ? (
          <div className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-center">
            <p className="text-gray-400">No industries configured</p>
            <button
              onClick={() => window.location.href = '/industry-settings'}
              className="mt-2 text-[#fbbf24] hover:text-[#f59e0b] text-sm"
            >
              Configure Industries
            </button>
          </div>
        ) : (
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white"
            required
          >
            <option value="">Select Industry</option>
            {industries.map(industry => (
              <option key={industry.id} value={industry.id}>
                {industry.icon} {industry.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Pricing Tier */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Pricing Tier</label>
        <div className="grid grid-cols-3 gap-3">
          {(['budget', 'standard', 'premium'] as const).map(tier => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`p-4 rounded-lg border-2 transition-all
                ${selectedTier === tier
                  ? 'bg-[#0f1729] border-[#fbbf24]'
                  : 'bg-[#111] border-[#2a2a2a] hover:border-[#3a3a3a]'}`}
            >
              <div className="text-lg font-semibold capitalize">{tier}</div>
              <div className="text-sm text-gray-400 mt-1">
                {tier === 'budget' && '15-20% markup'}
                {tier === 'standard' && '30-35% markup'}
                {tier === 'premium' && '50-60% markup'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Markup */}
      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={useCustomMarkup}
            onChange={(e) => setUseCustomMarkup(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm font-medium text-gray-300">Use Custom Markup</span>
        </label>
        {useCustomMarkup && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={customMarkup}
              onChange={(e) => setCustomMarkup(e.target.value)}
              min="0"
              max="200"
              className="w-24 px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white"
            />
            <span className="text-gray-400">%</span>
          </div>
        )}
      </div>

      {/* Name Customization */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Name Customization (Optional)</label>
        <div className="space-y-3">
          <input
            type="text"
            value={namePrefix}
            onChange={(e) => setNamePrefix(e.target.value)}
            placeholder="Prefix (e.g., 'Premium')"
            className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white"
          />
          <input
            type="text"
            value={nameSuffix}
            onChange={(e) => setNameSuffix(e.target.value)}
            placeholder="Suffix (e.g., '- Installed')"
            className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={() => setCurrentStep(1)}
          className="px-6 py-2 text-gray-400 hover:text-white"
        >
          Back
        </button>
        <button
          onClick={handleGeneratePreview}
          disabled={!selectedIndustry || isGenerating}
          className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2
            ${selectedIndustry && !isGenerating
              ? 'bg-[#fbbf24] text-black hover:bg-[#f59e0b]'
              : 'bg-[#1a1a1a] text-gray-600 cursor-not-allowed'}`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              Generate Preview
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-[#111] border border-[#2a2a2a] rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-2">
          Ready to create {generatedProducts.length} products
        </h3>
        <p className="text-sm text-gray-400">
          Review the products below before creating them in your catalog.
        </p>
      </div>

      {/* Preview list */}
      <div className="max-h-96 overflow-y-auto space-y-2">
        {generatedProducts.map((product, index) => (
          <div key={index} className="p-4 bg-[#111] border border-[#2a2a2a] rounded-lg">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-medium text-white">{product.name}</h4>
                <p className="text-sm text-gray-400 mt-1">{product.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>Unit: {product.unit}</span>
                  <span>Base: {formatCurrency(product.base_cost)}</span>
                  <span>Markup: {product.markup_percentage}%</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-[#fbbf24]">
                  {formatCurrency(product.price)}
                </div>
                <div className="text-xs text-gray-500">/{product.unit}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-500">Errors occurred:</p>
              <ul className="mt-1 space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-400">{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={() => setCurrentStep(2)}
          disabled={isCreating}
          className="px-6 py-2 text-gray-400 hover:text-white"
        >
          Back
        </button>
        <button
          onClick={handleCreateProducts}
          disabled={isCreating || errors.length > 0}
          className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2
            ${!isCreating && errors.length === 0
              ? 'bg-[#fbbf24] text-black hover:bg-[#f59e0b]'
              : 'bg-[#1a1a1a] text-gray-600 cursor-not-allowed'}`}
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating Products...
            </>
          ) : (
            <>
              <Package className="w-4 h-4" />
              Create {generatedProducts.length} Products
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl">
      <div className="bg-[#0a0a0a] rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a]">
          <div>
            <h2 className="text-2xl font-bold text-white">Generate Products from Cost Codes</h2>
            <p className="text-sm text-gray-400 mt-1">
              Create multiple products with industry-specific markup
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {renderStepIndicator()}
          
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>
      </div>
    </Modal>
  );
};