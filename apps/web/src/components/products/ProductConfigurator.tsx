import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../utils/format';

interface ProductAttribute {
  id: string;
  product_id: string;
  option_name: string;
  option_value: string;
  price_delta: number;
  unit: string | null;
}

interface AttributeGroup {
  name: string;
  options: ProductAttribute[];
}

interface ProductConfiguratorProps {
  productId: string;
  basePrice: number;
  onConfigurationChange?: (totalPrice: number, selectedOptions: Record<string, string>) => void;
}

const ProductConfigurator: React.FC<ProductConfiguratorProps> = ({
  productId,
  basePrice,
  onConfigurationChange
}) => {
  const [attributeGroups, setAttributeGroups] = useState<AttributeGroup[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [optionsPrice, setOptionsPrice] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(basePrice);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const demoAttributes = [
      {
        id: 'demo1',
        product_id: productId || 'demo',
        option_name: 'Grade',
        option_value: 'Standard',
        price_delta: 0,
        unit: null
      },
      {
        id: 'demo2',
        product_id: productId || 'demo',
        option_name: 'Grade',
        option_value: 'Premium',
        price_delta: 10,
        unit: null
      },
      {
        id: 'demo3',
        product_id: productId || 'demo',
        option_name: 'Size',
        option_value: 'Regular',
        price_delta: 0,
        unit: null
      },
      {
        id: 'demo4',
        product_id: productId || 'demo',
        option_name: 'Size',
        option_value: 'Large',
        price_delta: 5,
        unit: null
      }
    ];

    const processAttributes = (attributesData: ProductAttribute[]) => {
      if (!isMounted) return;

      const groups: Record<string, ProductAttribute[]> = {};

      attributesData.forEach(attr => {
        if (!groups[attr.option_name]) {
          groups[attr.option_name] = [];
        }

        groups[attr.option_name].push(attr);
      });

      const groupsArray = Object.entries(groups).map(([name, options]) => ({
        name,
        options
      }));

      setAttributeGroups(groupsArray);

      const defaults: Record<string, string> = {};
      let defaultOptionsPrice = 0;

      groupsArray.forEach(group => {
        if (group.options.length > 0) {
          const defaultOption = group.options.find(opt => opt.price_delta === 0) || group.options[0];
          defaults[group.name] = defaultOption.option_value;
          defaultOptionsPrice += defaultOption.price_delta;
        }
      });

      setSelectedOptions(defaults);
      setOptionsPrice(defaultOptionsPrice);
      setTotalPrice(basePrice + defaultOptionsPrice);

      if (onConfigurationChange && isMounted) {
        onConfigurationChange(basePrice + defaultOptionsPrice, defaults);
      }

      if (isMounted) setLoading(false);
    };

    processAttributes(demoAttributes);

    const fetchRealAttributes = async () => {
      if (!productId || !isMounted) return;

      try {
        const { data, error } = await supabase
          .from('product_attributes')
          .select('*')
          .eq('product_id', productId);

        if (error) {
          console.error('Error fetching product attributes:', error);
          return;
        }

        if (data && data.length > 0 && isMounted) {
          processAttributes(data);
        }
      } catch (error) {
        console.error('Error in fetchRealAttributes:', error);
      }
    };

    fetchRealAttributes();

    return () => {
      isMounted = false;
    };
  }, [productId, basePrice, onConfigurationChange]);

  const selectOption = (groupName: string, optionValue: string) => {
    // Find the selected option to get its price_delta
    const group = attributeGroups.find(g => g.name === groupName);
    const option = group?.options.find(o => o.option_value === optionValue);
    
    if (!option) return;
    
    // Calculate the price difference
    const oldOption = group?.options.find(o => o.option_value === selectedOptions[groupName]);
    const oldPriceDelta = oldOption?.price_delta || 0;
    const newPriceDelta = option.price_delta;
    const priceDifference = newPriceDelta - oldPriceDelta;
    
    // Update selected options
    const newSelectedOptions = {
      ...selectedOptions,
      [groupName]: optionValue
    };
    
    setSelectedOptions(newSelectedOptions);
    
    // Update prices
    const newOptionsPrice = optionsPrice + priceDifference;
    setOptionsPrice(newOptionsPrice);
    setTotalPrice(basePrice + newOptionsPrice);
    
    // Notify parent component
    if (onConfigurationChange) {
      onConfigurationChange(basePrice + newOptionsPrice, newSelectedOptions);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-[#FF3B30] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] shadow-lg"></div>
        <p className="mt-4 text-white text-opacity-70 text-lg">Loading product options...</p>
      </div>
    );
  }

  // We should always have demo attributes at minimum
  if (attributeGroups.length === 0 && !loading) {
    return (
      <div className="p-6 text-center bg-white bg-opacity-15 rounded-lg shadow-lg border-2 border-white border-opacity-20">
        <p className="text-white text-opacity-70 text-lg">Loading product options...</p>
      </div>
    );
  }

  return (
    <div className="product-configurator">
      {/* Attribute groups */}
      {attributeGroups.map(group => (
        <div key={group.name} className="attribute-group mb-8">
          <h3 className="text-lg font-medium text-white mb-4 uppercase">{group.name}</h3>
          
          <div className="attribute-options flex flex-wrap gap-4">
            {group.options.map(option => (
              <button 
                key={option.id}
                className={`option-card px-6 py-4 rounded-full border-2 ${
                  selectedOptions[group.name] === option.option_value 
                    ? 'border-[#FF3B30] bg-[#FF3B30] bg-opacity-20 text-white shadow-lg' 
                    : 'border-white border-opacity-20 bg-white bg-opacity-10 text-white hover:bg-opacity-15 hover:border-opacity-30 shadow-lg'
                } transition-colors`}
                onClick={() => selectOption(group.name, option.option_value)}
              >
                <div className="flex items-center gap-3">
                  <div className="option-name font-medium text-lg">{option.option_value}</div>
                  
                  {option.price_delta !== 0 && (
                    <div className="price-delta">
                      {option.price_delta > 0 ? (
                        <span className="text-[#6BFF90] font-bold">+{formatCurrency(option.price_delta)}</span>
                      ) : (
                        <span className="text-[#F41857] font-bold">{formatCurrency(option.price_delta)}</span>
                      )}
                    </div>
                  )}
                  
                  {option.unit && (
                    <div className="unit-label text-sm text-white text-opacity-70">/{option.unit}</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
      
      {/* Configuration summary */}
      <div className="configuration-summary mt-8 p-6 bg-white bg-opacity-15 rounded-lg shadow-lg border-2 border-white border-opacity-20">
        <h3 className="text-xl font-bold text-white mb-4">Configuration Summary</h3>
        
        <div className="selected-options mb-6">
          {Object.entries(selectedOptions).map(([groupName, optionValue]) => (
            <div key={groupName} className="selected-option flex justify-between py-3 border-b-2 border-white border-opacity-20">
              <span className="option-label text-white text-opacity-70 text-lg">{groupName}:</span>
              <span className="text-white font-medium text-lg">{optionValue}</span>
            </div>
          ))}
        </div>
        
        <div className="price-summary bg-[#232635] p-4 rounded-lg">
          <div className="base-price flex justify-between py-2">
            <span className="text-white text-opacity-70 text-lg">Base Price:</span>
            <span className="text-white text-lg">{formatCurrency(basePrice)}</span>
          </div>
          
          <div className="options-price flex justify-between py-2">
            <span className="text-white text-opacity-70 text-lg">Options:</span>
            <span className={optionsPrice > 0 ? 'text-[#6BFF90] font-bold text-lg' : optionsPrice < 0 ? 'text-[#F41857] font-bold text-lg' : 'text-white text-opacity-70 text-lg'}>
              {optionsPrice > 0 ? '+' : ''}{formatCurrency(optionsPrice)}
            </span>
          </div>
          
          <div className="total-price flex justify-between py-3 border-t-2 border-white border-opacity-20 mt-2">
            <span className="font-bold text-white text-xl">Total:</span>
            <span className="font-bold text-white text-xl">{formatCurrency(totalPrice)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductConfigurator;
