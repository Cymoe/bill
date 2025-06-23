import { useState } from 'react';

const ProductCardViewDemo = () => {
  const [viewMode, setViewMode] = useState('cards'); // 'list' or 'cards'
  
  // Sample data
  const products = [
    {
      id: 1,
      name: 'Exterior Door Installation',
      category: 'Carpentry',
      description: 'Professional installation of exterior doors',
      variantCount: 3,
      thumbnail: '🚪',
      variants: [
        { name: 'Standard Door (36" Single)', price: 750, grade: 'Standard' },
        { name: 'Double Door System', price: 1200, grade: 'Medium' },
        { name: 'Premium Entry Door (300lb)', price: 1850, grade: 'Premium' }
      ]
    },
    {
      id: 2,
      name: 'Ceiling Fan Installation',
      category: 'Electrical',
      description: 'Installation of ceiling fans with optional lighting',
      variantCount: 2,
      thumbnail: '💡',
      variants: [
        { name: 'Basic Fan Installation', price: 180, grade: 'Standard' },
        { name: 'Deluxe Fan with Light Kit', price: 275, grade: 'Premium' }
      ]
    },
    {
      id: 3,
      name: 'Bathroom Sink Replacement',
      category: 'Plumbing',
      description: 'Replace existing bathroom sink with new fixture',
      variantCount: 3,
      thumbnail: '🚿',
      variants: [
        { name: 'Basic Sink Replacement', price: 350, grade: 'Standard' },
        { name: 'Vanity Sink Replacement', price: 520, grade: 'Medium' },
        { name: 'Custom Sink with Cabinet Modification', price: 875, grade: 'Premium' }
      ]
    },
    {
      id: 4,
      name: 'Interior Painting',
      category: 'Painting',
      description: 'Professional interior painting services',
      variantCount: 3,
      thumbnail: '🎨',
      variants: [
        { name: 'Single Room Painting', price: 550, grade: 'Standard' },
        { name: 'Multi-Room Painting', price: 1200, grade: 'Medium' },
        { name: 'Whole House Painting', price: 3500, grade: 'Premium' }
      ]
    },
    {
      id: 5,
      name: 'Kitchen Backsplash Installation',
      category: 'Tile',
      description: 'Installation of tile backsplash in kitchen area',
      variantCount: 3,
      thumbnail: '🧱',
      variants: [
        { name: 'Basic Ceramic Tile', price: 750, grade: 'Standard' },
        { name: 'Glass Mosaic Tile', price: 1100, grade: 'Medium' },
        { name: 'Custom Pattern Natural Stone', price: 1800, grade: 'Premium' }
      ]
    },
    {
      id: 6,
      name: 'Deck Construction',
      category: 'Carpentry',
      description: 'Custom deck building and installation',
      variantCount: 3,
      thumbnail: '🪵',
      variants: [
        { name: 'Standard Pressure-Treated Deck', price: 3500, grade: 'Standard' },
        { name: 'Composite Deck', price: 5500, grade: 'Medium' },
        { name: 'Premium Hardwood Deck', price: 8500, grade: 'Premium' }
      ]
    }
  ];
  
  const toggleView = (mode: 'list' | 'cards') => {
    setViewMode(mode);
  };
  
  const renderListView = () => {
    return (
      <div className="space-y-4">
        {products.map(product => (
          <div key={product.id} className="bg-gray-800 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-white">{product.name}</h2>
                <div className="text-sm text-gray-400">
                  {product.category} • {product.variantCount} variants
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full flex items-center transition-colors">
                  <span className="mr-1">+</span> Add Variant
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition-colors">
                  Compare
                </button>
                <button className="text-gray-400 p-2">
                  ▶
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  const renderCardView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-[#1A1D2D] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="p-5 border-b border-gray-700">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-1 text-white">{product.name}</h2>
                  <div className="text-sm text-gray-400 mb-2">
                    {product.category} • {product.variantCount} variants
                  </div>
                </div>
                <div className="text-4xl">
                  {product.thumbnail}
                </div>
              </div>
              <p className="text-sm text-gray-300 line-clamp-2">{product.description}</p>
            </div>
            
            <div className="p-3 bg-[#232635] border-b border-gray-700">
              <div className="text-sm font-medium text-gray-300 mb-2">Available Variants:</div>
              <div className="space-y-1.5">
                {product.variants.map((variant, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        variant.grade === 'Standard' ? 'bg-green-500' : 
                        variant.grade === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-sm truncate max-w-[160px] text-white">{variant.name}</span>
                    </div>
                    <span className="text-sm font-medium text-white">${variant.price}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-3 bg-[#1A1D2D] flex space-x-2">
              <button className="bg-blue-600 hover:bg-blue-700 text-white flex-grow px-3 py-1.5 rounded-full text-sm font-medium flex items-center justify-center transition-colors">
                <span className="mr-1">+</span> Add Variant
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white flex-grow px-3 py-1.5 rounded-full text-sm font-medium transition-colors">
                Compare
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 bg-[#121212] text-white min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Products</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-[#232635] rounded-full">
            <button 
              className={`px-4 py-2 rounded-full ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
              onClick={() => toggleView('list')}
            >
              List View
            </button>
            <button 
              className={`px-4 py-2 rounded-full ${viewMode === 'cards' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
              onClick={() => toggleView('cards')}
            >
              Card View
            </button>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full flex items-center transition-colors">
            <span className="mr-1">+</span> New Product
          </button>
        </div>
      </div>
      
      <div className="text-sm text-gray-400 mb-6">Manage all your products and variants in one place</div>
      
      <div className="flex justify-between mb-6">
        <div className="relative w-60">
          <select className="w-full bg-[#232635] text-white p-2 rounded-full border border-gray-700">
            <option>All Categories (5)</option>
            <option>Carpentry</option>
            <option>Electrical</option>
            <option>Plumbing</option>
            <option>Painting</option>
            <option>Tile</option>
          </select>
        </div>
        <div className="relative w-60">
          <select className="w-full bg-[#232635] text-white p-2 rounded-full border border-gray-700">
            <option>Sort by: Recently Used</option>
            <option>Name (A-Z)</option>
            <option>Price (Low to High)</option>
            <option>Price (High to Low)</option>
          </select>
        </div>
      </div>
      
      {viewMode === 'list' ? renderListView() : renderCardView()}
    </div>
  );
};

export default ProductCardViewDemo;
