import React from 'react';
import { ChevronDown, ChevronRight, Zap, Thermometer, Shield, Clock, Ruler, Droplets, Settings, Battery, Sun, Wrench } from 'lucide-react';

interface ServiceAttributesDisplayProps {
  attributes: Record<string, any>;
  industry?: string;
  isExpanded?: boolean;
  onToggle?: () => void;
  showAll?: boolean;
}

// Industry-specific attribute metadata
const attributeMetadata: Record<string, Record<string, { label: string; icon?: React.ReactNode; format?: (value: any) => string }>> = {
  hvac: {
    btu: { 
      label: 'BTU Rating', 
      icon: <Thermometer className="w-3 h-3" />,
      format: (v) => `${v.toLocaleString()} BTU`
    },
    seer: { 
      label: 'SEER Rating', 
      icon: <Zap className="w-3 h-3" />,
      format: (v) => `${v} SEER`
    },
    energy_star: { 
      label: 'Energy Star', 
      icon: <Shield className="w-3 h-3" />,
      format: (v) => v ? 'Certified' : 'Not Certified'
    },
    tonnage: { 
      label: 'Tonnage', 
      format: (v) => `${v} Ton`
    },
    coverage_sqft: { 
      label: 'Coverage Area', 
      icon: <Ruler className="w-3 h-3" />,
      format: (v) => `${v.toLocaleString()} sq ft`
    },
    voltage: { label: 'Voltage' },
    efficiency_percent: { 
      label: 'Efficiency', 
      format: (v) => `${v}%`
    },
    fuel_type: { 
      label: 'Fuel Type',
      format: (v) => v.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    },
    warranty_years: { 
      label: 'Warranty', 
      icon: <Shield className="w-3 h-3" />,
      format: (v) => `${v} Years`
    }
  },
  painting: {
    voc_level: { 
      label: 'VOC Level', 
      icon: <Droplets className="w-3 h-3" />,
      format: (v) => v.charAt(0).toUpperCase() + v.slice(1)
    },
    voc_grams_per_liter: { 
      label: 'VOC Content', 
      format: (v) => `${v} g/L`
    },
    coverage_sqft_per_gallon: { 
      label: 'Coverage', 
      icon: <Ruler className="w-3 h-3" />,
      format: (v) => `${v} sq ft/gal`
    },
    dry_time_hours: { 
      label: 'Dry Time', 
      icon: <Clock className="w-3 h-3" />,
      format: (v) => `${v} hours`
    },
    sheen: { 
      label: 'Sheen',
      format: (v) => v.charAt(0).toUpperCase() + v.slice(1)
    },
    coats_required: { 
      label: 'Coats Required',
      format: (v) => `${v} coats`
    }
  },
  windows: {
    glass_type: { 
      label: 'Glass Type',
      format: (v) => v.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    },
    u_factor: { 
      label: 'U-Factor', 
      icon: <Thermometer className="w-3 h-3" />,
      format: (v) => v.toFixed(2)
    },
    shgc: { 
      label: 'SHGC', 
      format: (v) => v.toFixed(2)
    },
    energy_star: { 
      label: 'Energy Star', 
      icon: <Shield className="w-3 h-3" />,
      format: (v) => v ? 'Certified' : 'Not Certified'
    },
    frame_material: { 
      label: 'Frame Material',
      format: (v) => v.charAt(0).toUpperCase() + v.slice(1)
    },
    operation_type: { 
      label: 'Operation',
      format: (v) => v.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  },
  flooring: {
    wood_species: { 
      label: 'Wood Species',
      format: (v) => v.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    },
    thickness: { 
      label: 'Thickness',
      format: (v) => v
    },
    finish: { 
      label: 'Finish',
      format: (v) => v.charAt(0).toUpperCase() + v.slice(1)
    },
    installation_method: { 
      label: 'Installation',
      format: (v) => v.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    },
    grade: { 
      label: 'Grade',
      format: (v) => v.charAt(0).toUpperCase() + v.slice(1)
    }
  },
  roofing: {
    material_type: { 
      label: 'Material',
      format: (v) => v.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    },
    wind_rating: { 
      label: 'Wind Rating', 
      icon: <Shield className="w-3 h-3" />,
      format: (v) => `${v} mph`
    },
    fire_rating: { 
      label: 'Fire Rating',
      icon: <Shield className="w-3 h-3" />,
      format: (v) => v.toUpperCase()
    },
    impact_rating: { 
      label: 'Impact Rating',
      format: (v) => `Class ${v}`
    },
    warranty_years: { 
      label: 'Warranty', 
      icon: <Shield className="w-3 h-3" />,
      format: (v) => `${v} Years`
    }
  },
  plumbing: {
    pipe_diameter: { 
      label: 'Pipe Size',
      icon: <Ruler className="w-3 h-3" />,
      format: (v) => v
    },
    pressure_rating: { 
      label: 'Pressure Rating',
      format: (v) => v
    },
    temperature_rating: { 
      label: 'Max Temp',
      icon: <Thermometer className="w-3 h-3" />,
      format: (v) => v
    },
    includes_insulation: { 
      label: 'Insulation',
      format: (v) => v ? 'Included' : 'Not Included'
    },
    permit_required: { 
      label: 'Permit',
      format: (v) => v ? 'Required' : 'Not Required'
    }
  },
  electrical: {
    voltage: { 
      label: 'Voltage',
      icon: <Zap className="w-3 h-3" />,
      format: (v) => v
    },
    amperage: { 
      label: 'Amperage',
      icon: <Zap className="w-3 h-3" />,
      format: (v) => v
    },
    wire_gauge: { 
      label: 'Wire Gauge',
      format: (v) => `${v} AWG`
    },
    code_compliance: { 
      label: 'Code Compliant',
      icon: <Shield className="w-3 h-3" />,
      format: (v) => v ? 'Yes' : 'No'
    },
    response_time: { 
      label: 'Response Time',
      icon: <Clock className="w-3 h-3" />,
      format: (v) => v
    }
  },
  solar: {
    system_size: { 
      label: 'System Size',
      icon: <Sun className="w-3 h-3" />,
      format: (v) => v
    },
    panel_count: { 
      label: 'Panel Count',
      format: (v) => `${v} panels`
    },
    efficiency: { 
      label: 'Efficiency',
      format: (v) => v
    },
    inverter_type: { 
      label: 'Inverter Type',
      icon: <Settings className="w-3 h-3" />,
      format: (v) => v.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    },
    monitoring: { 
      label: 'Monitoring',
      format: (v) => v.charAt(0).toUpperCase() + v.slice(1)
    },
    battery_capacity: { 
      label: 'Battery Capacity',
      icon: <Battery className="w-3 h-3" />,
      format: (v) => v
    }
  },
  landscaping: {
    plant_type: { 
      label: 'Plant Type',
      format: (v) => v.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    },
    maintenance_level: { 
      label: 'Maintenance',
      format: (v) => v.charAt(0).toUpperCase() + v.slice(1)
    },
    drought_tolerant: { 
      label: 'Drought Tolerant',
      icon: <Droplets className="w-3 h-3" />,
      format: (v) => v ? 'Yes' : 'No'
    },
    sun_requirements: { 
      label: 'Sun Requirements',
      icon: <Sun className="w-3 h-3" />,
      format: (v) => v.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    },
    includes_irrigation: { 
      label: 'Irrigation',
      icon: <Droplets className="w-3 h-3" />,
      format: (v) => v ? 'Included' : 'Not Included'
    }
  }
};

// Get attribute config for a specific industry
const getAttributeConfig = (industry: string, key: string) => {
  const industryKey = industry?.toLowerCase() || 'general';
  return attributeMetadata[industryKey]?.[key] || {
    label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    format: (v: any) => String(v)
  };
};

// Determine which attributes are "important" to show when collapsed
const importantAttributes = [
  'btu', 'seer', 'energy_star', 'voc_level', 'glass_type', 'wood_species', 
  'material_type', 'wind_rating', 'fire_rating', 'system_size', 'efficiency',
  'pipe_diameter', 'pressure_rating', 'voltage', 'response_time', 'drought_tolerant'
];

export const ServiceAttributesDisplay: React.FC<ServiceAttributesDisplayProps> = ({
  attributes,
  industry,
  isExpanded = false,
  onToggle,
  showAll = false
}) => {
  if (!attributes || Object.keys(attributes).length === 0) {
    return null;
  }

  const keys = Object.keys(attributes);
  const displayKeys = showAll || isExpanded 
    ? keys 
    : keys.filter(k => importantAttributes.includes(k)).slice(0, 3);

  return (
    <div className="mt-2">
      {onToggle && keys.length > 3 && (
        <button
          onClick={onToggle}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-300 mb-2"
        >
          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          {isExpanded ? 'Hide' : 'Show'} Technical Details
        </button>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {displayKeys.map(key => {
          const config = getAttributeConfig(industry || '', key);
          const value = attributes[key];
          
          return (
            <div key={key} className="flex items-start gap-1.5 text-xs">
              {config.icon && (
                <span className="text-gray-500 mt-0.5">{config.icon}</span>
              )}
              <div>
                <span className="text-gray-500">{config.label}:</span>
                <span className="text-gray-300 ml-1 font-medium">
                  {config.format ? config.format(value) : value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      {!showAll && !isExpanded && keys.length > 3 && (
        <p className="text-xs text-gray-500 mt-1">
          +{keys.length - 3} more specifications
        </p>
      )}
    </div>
  );
};