import React from 'react';
import { Building2 } from 'lucide-react';

interface PropertyTypeCardProps {
  title: string;
  count: number;
  image?: string;
  onClick: () => void;
  isActive: boolean;
}

export const PropertyTypeCard: React.FC<PropertyTypeCardProps> = ({
  title,
  count,
  image,
  onClick,
  isActive
}) => {
  return (
    <div 
      className={`relative cursor-pointer transition-all duration-300 ${
        isActive 
          ? 'ring-2 ring-blue-600 transform scale-[1.02]' 
          : 'hover:shadow-lg'
      }`}
      onClick={onClick}
      style={{ 
        borderRadius: '4px'
      }}
    >
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200" style={{ borderRadius: '4px' }}>
        {/* Image/Background */}
        <div className="h-32 bg-gray-200 relative">
          {image ? (
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ 
                backgroundImage: `url('${image}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          ) : (
            <div 
              className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center"
              style={{ background: 'linear-gradient(to bottom right, #5588bb, #336699)' }}
            >
              <Building2 className="h-12 w-12 text-white opacity-50" />
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <h3 className="text-white text-xl font-bold uppercase tracking-wider text-center px-4">
              {title}
            </h3>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-3 flex justify-between items-center">
          <span className="text-sm text-gray-600 font-medium">{count} Projects</span>
          <span 
            className={`px-2 py-1 text-xs rounded-full ${
              isActive 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700'
            }`}
            style={{ 
              backgroundColor: isActive ? '#336699' : undefined,
              borderRadius: '9999px'
            }}
          >
            {isActive ? 'Selected' : 'View'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PropertyTypeCard;
