import React from 'react';
import { formatCurrency } from '../../utils/format';

interface ServiceOptionUnitDisplayProps {
  serviceOption: any;
  quantity: number;
}

export function ServiceOptionUnitDisplay({ serviceOption, quantity }: ServiceOptionUnitDisplayProps) {
  if (!serviceOption.service_option_items) return null;

  const getUnitDisplay = (item: any) => {
    const { line_item, quantity: itemQuantity, calculation_type } = item;
    
    // Default to multiply if not specified
    const calcType = calculation_type || 'multiply';
    
    if (calcType === 'per_unit') {
      if (line_item.unit === 'hour') {
        return (
          <span className="text-xs text-gray-500">
            {itemQuantity} hours per {serviceOption.unit}
          </span>
        );
      }
      return (
        <span className="text-xs text-gray-500">
          {itemQuantity} {line_item.unit} per {serviceOption.unit}
        </span>
      );
    } else if (calcType === 'fixed') {
      return (
        <span className="text-xs text-gray-500">
          Fixed: {itemQuantity} {line_item.unit}
        </span>
      );
    } else {
      // multiply type
      return (
        <span className="text-xs text-gray-500">
          {itemQuantity} × {quantity} = {(itemQuantity * quantity).toFixed(2)} {line_item.unit}
        </span>
      );
    }
  };

  const getTotalCalculation = (item: any) => {
    const { line_item, quantity: itemQuantity, calculation_type } = item;
    const calcType = calculation_type || 'multiply';
    
    let totalQuantity: number;
    if (calcType === 'fixed') {
      totalQuantity = itemQuantity;
    } else {
      // Both multiply and per_unit use the same calculation
      totalQuantity = itemQuantity * quantity;
    }
    
    const totalPrice = totalQuantity * line_item.price;
    return { totalQuantity, totalPrice };
  };

  // Group items by type
  const laborItems = serviceOption.service_option_items.filter(
    item => item.line_item.unit === 'hour'
  );
  const materialItems = serviceOption.service_option_items.filter(
    item => item.line_item.unit !== 'hour'
  );

  return (
    <div className="space-y-3">
      {laborItems.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">Labor</h4>
          <div className="space-y-1">
            {laborItems.map((item) => {
              const { totalQuantity, totalPrice } = getTotalCalculation(item);
              return (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div>
                    <span className="text-gray-900">{item.line_item.name}</span>
                    <span className="ml-2">{getUnitDisplay(item)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-600">{totalQuantity.toFixed(2)} hours</span>
                    <span className="ml-2 font-medium">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {materialItems.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">Materials</h4>
          <div className="space-y-1">
            {materialItems.map((item) => {
              const { totalQuantity, totalPrice } = getTotalCalculation(item);
              return (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div>
                    <span className="text-gray-900">{item.line_item.name}</span>
                    <span className="ml-2">{getUnitDisplay(item)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-600">
                      {totalQuantity.toFixed(2)} {item.line_item.unit}
                    </span>
                    <span className="ml-2 font-medium">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}