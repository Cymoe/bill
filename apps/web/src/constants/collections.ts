// Predefined collections for products (bundles)
export const PRODUCT_COLLECTIONS = [
  { value: '', label: 'Select Collection' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'bathroom', label: 'Bathroom' },
  { value: 'flooring', label: 'Flooring' },
  { value: 'roofing', label: 'Roofing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'painting', label: 'Painting' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'concrete', label: 'Concrete' },
  { value: 'framing', label: 'Framing' },
  { value: 'siding', label: 'Siding' },
  { value: 'windows-doors', label: 'Windows & Doors' },
  { value: 'insulation', label: 'Insulation' },
  { value: 'drywall', label: 'Drywall' },
  { value: 'tile', label: 'Tile' },
  { value: 'carpentry', label: 'Carpentry' },
  { value: 'demolition', label: 'Demolition' },
  { value: 'general', label: 'General' }
];

// Get collection label by value
export const getCollectionLabel = (value: string): string => {
  const collection = PRODUCT_COLLECTIONS.find(col => col.value === value);
  return collection?.label || value;
}; 