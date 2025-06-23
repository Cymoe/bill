import React, { useState, useEffect } from 'react';
import { Package, Zap, Check, ChevronRight, Building, Home, Wrench, Paintbrush, TreePine, Bath, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../utils/format';
import { WorkPackService } from '../../services/WorkPackService';

interface Industry {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

interface WorkPack {
  id: string;
  name: string;
  description: string;
  industry_id: string;
  project_type_id: string;
  tier: 'budget' | 'standard' | 'premium';
  base_price: number;
  estimated_hours: number;
  typical_duration_days: number;
  included_items: string[];
  required_permits: string[];
  key_tasks: string[];
}

interface IndustryWorkPackTemplatesProps {
  selectedIndustry: string;
  selectedProjectType: string;
  onSelectWorkPack: (workPack: WorkPack) => void;
  organizationId: string;
}

// Predefined work packs by industry
const INDUSTRY_WORK_PACKS: Record<string, WorkPack[]> = {
  'general-construction': [
    // New Home Construction
    {
      id: 'new-home-budget',
      name: 'Budget New Home Construction',
      description: 'Basic single-family home with standard finishes and builder-grade materials',
      industry_id: 'general-construction',
      project_type_id: 'new-home-construction',
      tier: 'budget',
      base_price: 350000,
      estimated_hours: 1200,
      typical_duration_days: 120,
      included_items: [
        'Architectural plans and engineering',
        'All required permits and inspections',
        'Standard foundation and framing',
        'Builder-grade windows and doors',
        'Basic kitchen with stock cabinets',
        'Standard plumbing and electrical',
        'Forced air heating and cooling',
        'Laminate and carpet flooring',
        'Basic landscaping package'
      ],
      required_permits: ['Building Permit', 'Electrical Permit', 'Plumbing Permit', 'Mechanical Permit'],
      key_tasks: [
        'Site preparation and excavation',
        'Foundation and concrete work',
        'Framing and structural work',
        'Roofing and exterior',
        'MEP rough-in',
        'Insulation and drywall',
        'Interior finishes',
        'Final inspections'
      ]
    },
    {
      id: 'new-home-standard',
      name: 'Standard New Home Construction',
      description: 'Quality home with upgraded finishes, energy-efficient features, and brand-name fixtures',
      industry_id: 'general-construction',
      project_type_id: 'new-home-construction',
      tier: 'standard',
      base_price: 600000,
      estimated_hours: 1600,
      typical_duration_days: 150,
      included_items: [
        'Custom architectural design',
        'Energy-efficient windows and doors',
        'Semi-custom kitchen cabinets',
        'Granite or quartz countertops',
        'Hardwood and tile flooring',
        'High-efficiency HVAC system',
        'Smart home pre-wiring',
        'Quality fixtures and finishes',
        'Professional landscaping design'
      ],
      required_permits: ['Building Permit', 'Electrical Permit', 'Plumbing Permit', 'Mechanical Permit', 'Grading Permit'],
      key_tasks: [
        'Design and engineering',
        'Site work and utilities',
        'Foundation with waterproofing',
        'Advanced framing techniques',
        'Premium roofing system',
        'Complete MEP systems',
        'Custom millwork and trim',
        'Professional finishes'
      ]
    },
    {
      id: 'new-home-premium',
      name: 'Premium New Home Construction',
      description: 'Luxury custom home with high-end finishes, smart home features, and premium materials',
      industry_id: 'general-construction',
      project_type_id: 'new-home-construction',
      tier: 'premium',
      base_price: 1000000,
      estimated_hours: 2400,
      typical_duration_days: 210,
      included_items: [
        'Full custom architectural design',
        'Premium windows and doors',
        'Custom cabinetry throughout',
        'Natural stone countertops',
        'Hardwood and natural stone flooring',
        'Geothermal or high-end HVAC',
        'Complete smart home system',
        'Designer fixtures and appliances',
        'Custom pool and outdoor living'
      ],
      required_permits: ['Building Permit', 'Electrical Permit', 'Plumbing Permit', 'Mechanical Permit', 'Pool Permit'],
      key_tasks: [
        'Custom design process',
        'Engineered foundation system',
        'Steel or timber frame construction',
        'Custom exterior cladding',
        'High-end MEP systems',
        'Smart home integration',
        'Luxury interior finishes',
        'Landscape and hardscape'
      ]
    },
    // Home Addition
    {
      id: 'addition-budget',
      name: 'Budget Home Addition',
      description: 'Basic room addition with standard finishes, 400-600 sq ft',
      industry_id: 'general-construction',
      project_type_id: 'home-addition',
      tier: 'budget',
      base_price: 75000,
      estimated_hours: 400,
      typical_duration_days: 45,
      included_items: [
        'Basic architectural plans',
        'Standard foundation',
        'Wood frame construction',
        'Match existing siding',
        'Basic electrical and plumbing',
        'Standard insulation',
        'Drywall and paint',
        'Carpet or vinyl flooring'
      ],
      required_permits: ['Building Permit', 'Electrical Permit'],
      key_tasks: [
        'Foundation excavation',
        'Pour concrete foundation',
        'Frame walls and roof',
        'Install windows and doors',
        'Rough-in utilities',
        'Insulation and drywall',
        'Flooring and trim',
        'Final connections'
      ]
    },
    {
      id: 'addition-standard',
      name: 'Standard Home Addition',
      description: 'Quality addition with good finishes and proper integration, 600-800 sq ft',
      industry_id: 'general-construction',
      project_type_id: 'home-addition',
      tier: 'standard',
      base_price: 150000,
      estimated_hours: 600,
      typical_duration_days: 60,
      included_items: [
        'Professional design and engineering',
        'Reinforced foundation',
        'Quality framing and sheathing',
        'Seamless exterior integration',
        'Full HVAC integration',
        'Upgraded insulation package',
        'Quality windows and doors',
        'Hardwood or tile flooring'
      ],
      required_permits: ['Building Permit', 'Electrical Permit', 'Plumbing Permit', 'Mechanical Permit'],
      key_tasks: [
        'Design and planning',
        'Foundation with stem wall',
        'Advanced framing',
        'Roof tie-in',
        'MEP rough-in',
        'Energy-efficient insulation',
        'Quality finishes',
        'Seamless integration'
      ]
    },
    // Office Build-Out
    {
      id: 'office-budget',
      name: 'Budget Office Build-Out',
      description: 'Basic office space with standard finishes, 2000-3000 sq ft',
      industry_id: 'general-construction',
      project_type_id: 'office-buildout',
      tier: 'budget',
      base_price: 120000,
      estimated_hours: 600,
      typical_duration_days: 30,
      included_items: [
        'Basic space planning',
        'Standard partition walls',
        'Basic electrical and data',
        'Standard lighting',
        'Commercial carpet',
        'Basic HVAC distribution',
        'Standard paint',
        'Code-compliant finishes'
      ],
      required_permits: ['Commercial Building Permit', 'Fire Safety Permit'],
      key_tasks: [
        'Space planning',
        'Demolition if needed',
        'Framing and drywall',
        'Electrical and data',
        'HVAC modifications',
        'Flooring installation',
        'Paint and finish',
        'Final inspections'
      ]
    },
    {
      id: 'office-standard',
      name: 'Standard Office Build-Out',
      description: 'Professional office with quality finishes, conference rooms, 3000-5000 sq ft',
      industry_id: 'general-construction',
      project_type_id: 'office-buildout',
      tier: 'standard',
      base_price: 250000,
      estimated_hours: 900,
      typical_duration_days: 45,
      included_items: [
        'Professional space planning',
        'Glass partition walls',
        'Full electrical and data infrastructure',
        'LED lighting with controls',
        'Mix of carpet and hard surfaces',
        'Dedicated HVAC zones',
        'Acoustic treatments',
        'Modern kitchen/break room'
      ],
      required_permits: ['Commercial Building Permit', 'Fire Safety Permit', 'Health Department Permit'],
      key_tasks: [
        'Design and permits',
        'Selective demolition',
        'MEP infrastructure',
        'Partition installation',
        'Technology infrastructure',
        'Specialty rooms',
        'Finishes and fixtures',
        'Commissioning'
      ]
    },
    // Whole House Renovation
    {
      id: 'renovation-budget',
      name: 'Budget Whole House Renovation',
      description: 'Cosmetic updates, paint, flooring, and fixture replacements',
      industry_id: 'general-construction',
      project_type_id: 'whole-house-renovation',
      tier: 'budget',
      base_price: 80000,
      estimated_hours: 600,
      typical_duration_days: 60,
      included_items: [
        'Interior and exterior paint',
        'New carpet and vinyl flooring',
        'Updated light fixtures',
        'New interior doors',
        'Basic kitchen refresh',
        'Bathroom fixture updates',
        'Basic landscaping cleanup'
      ],
      required_permits: ['Building Permit'],
      key_tasks: [
        'Initial assessment',
        'Protect existing finishes',
        'Paint preparation',
        'Flooring installation',
        'Fixture replacements',
        'Kitchen updates',
        'Bathroom updates',
        'Final cleanup'
      ]
    },
    {
      id: 'renovation-standard',
      name: 'Standard Whole House Renovation',
      description: 'Full renovation including kitchen, baths, systems updates',
      industry_id: 'general-construction',
      project_type_id: 'whole-house-renovation',
      tier: 'standard',
      base_price: 200000,
      estimated_hours: 1200,
      typical_duration_days: 120,
      included_items: [
        'Complete kitchen remodel',
        'All bathrooms renovated',
        'New flooring throughout',
        'Updated electrical system',
        'HVAC system upgrade',
        'New windows and doors',
        'Fresh interior and exterior paint',
        'Modernized fixtures and finishes'
      ],
      required_permits: ['Building Permit', 'Electrical Permit', 'Plumbing Permit', 'Mechanical Permit'],
      key_tasks: [
        'Design and planning',
        'Systems assessment',
        'Selective demolition',
        'Structural repairs',
        'MEP upgrades',
        'Kitchen and bath remodels',
        'Flooring and finishes',
        'Exterior updates'
      ]
    }
  ],
  'residential-construction': [
    {
      id: 'bath-remodel-budget',
      name: 'Budget Bathroom Remodel',
      description: 'Basic bathroom refresh with standard fixtures',
      industry_id: 'residential-construction',
      project_type_id: 'bathroom-remodel',
      tier: 'budget',
      base_price: 8500,
      estimated_hours: 60,
      typical_duration_days: 7,
      included_items: [
        'Standard toilet replacement',
        'Basic vanity installation',
        'Standard faucet and fixtures',
        'Vinyl flooring',
        'Basic paint refresh'
      ],
      required_permits: ['Plumbing permit'],
      key_tasks: [
        'Demo existing fixtures',
        'Install new plumbing fixtures',
        'Install flooring',
        'Paint and finish'
      ]
    },
    {
      id: 'bath-remodel-standard',
      name: 'Standard Bathroom Remodel',
      description: 'Complete bathroom renovation with quality fixtures',
      industry_id: 'residential-construction',
      project_type_id: 'bathroom-remodel',
      tier: 'standard',
      base_price: 15000,
      estimated_hours: 100,
      typical_duration_days: 14,
      included_items: [
        'Quality toilet and bidet',
        'Custom vanity with stone top',
        'Designer faucets and fixtures',
        'Tile flooring and shower surround',
        'Exhaust fan and lighting upgrade'
      ],
      required_permits: ['Plumbing permit', 'Electrical permit'],
      key_tasks: [
        'Full demo and disposal',
        'Plumbing rough-in updates',
        'Electrical updates',
        'Tile installation',
        'Fixture installation',
        'Final inspections'
      ]
    },
    {
      id: 'bath-remodel-premium',
      name: 'Premium Master Bath Suite',
      description: 'Luxury bathroom transformation with high-end finishes',
      industry_id: 'residential-construction',
      project_type_id: 'bathroom-remodel',
      tier: 'premium',
      base_price: 35000,
      estimated_hours: 180,
      typical_duration_days: 21,
      included_items: [
        'Luxury fixtures and smart toilet',
        'Custom double vanity with quartz',
        'Freestanding tub and walk-in shower',
        'Heated tile floors',
        'Designer lighting and mirrors',
        'Custom storage solutions'
      ],
      required_permits: ['Building permit', 'Plumbing permit', 'Electrical permit'],
      key_tasks: [
        'Architectural planning',
        'Full demo and structural prep',
        'Plumbing and electrical rough-in',
        'Custom tile and stone work',
        'Luxury fixture installation',
        'Smart home integration',
        'Final details and inspection'
      ]
    },
    {
      id: 'kitchen-remodel-standard',
      name: 'Standard Kitchen Remodel',
      description: 'Full kitchen renovation with new cabinets and appliances',
      industry_id: 'residential-construction',
      project_type_id: 'kitchen-remodel',
      tier: 'standard',
      base_price: 25000,
      estimated_hours: 160,
      typical_duration_days: 21,
      included_items: [
        'Stock cabinets with soft-close',
        'Quartz countertops',
        'Tile backsplash',
        'Stainless steel appliances',
        'Under-cabinet lighting'
      ],
      required_permits: ['Building permit', 'Electrical permit', 'Plumbing permit'],
      key_tasks: [
        'Demo existing kitchen',
        'Update plumbing and electrical',
        'Install cabinets and counters',
        'Install appliances',
        'Backsplash and finishing'
      ]
    }
  ],
  'commercial-construction': [
    {
      id: 'office-buildout-standard',
      name: 'Standard Office Build-Out',
      description: 'Complete office space preparation for business use',
      industry_id: 'commercial-construction',
      project_type_id: 'office-buildout',
      tier: 'standard',
      base_price: 50000,
      estimated_hours: 300,
      typical_duration_days: 30,
      included_items: [
        'Partition walls and doors',
        'Commercial flooring',
        'Drop ceiling with lighting',
        'HVAC distribution',
        'Basic electrical and data'
      ],
      required_permits: ['Commercial building permit', 'Fire safety permit'],
      key_tasks: [
        'Space planning and permits',
        'Framing and drywall',
        'MEP rough-in',
        'Flooring and ceiling',
        'Final finishes',
        'Certificate of occupancy'
      ]
    }
  ],
  'electrical': [
    {
      id: 'panel-upgrade-standard',
      name: '200 Amp Panel Upgrade',
      description: 'Upgrade electrical service to 200 amp panel',
      industry_id: 'electrical',
      project_type_id: 'panel-upgrade',
      tier: 'standard',
      base_price: 3500,
      estimated_hours: 16,
      typical_duration_days: 2,
      included_items: [
        '200 amp main panel',
        'New meter base',
        'Service entrance cable',
        'Grounding system upgrade',
        'Circuit breakers'
      ],
      required_permits: ['Electrical permit', 'Utility coordination'],
      key_tasks: [
        'Permit and utility coordination',
        'Install new panel and meter',
        'Transfer circuits',
        'Testing and inspection',
        'Utility reconnection'
      ]
    }
  ],
  'plumbing': [
    {
      id: 'water-heater-standard',
      name: 'Tank Water Heater Replacement',
      description: 'Replace existing water heater with new 50-gallon unit',
      industry_id: 'plumbing',
      project_type_id: 'water-heater',
      tier: 'standard',
      base_price: 2200,
      estimated_hours: 6,
      typical_duration_days: 1,
      included_items: [
        '50-gallon water heater',
        'Expansion tank',
        'New shut-off valve',
        'Flexible connections',
        'Disposal of old unit'
      ],
      required_permits: ['Plumbing permit'],
      key_tasks: [
        'Drain and remove old unit',
        'Install new water heater',
        'Update connections to code',
        'Test and inspection'
      ]
    }
  ]
};

export const IndustryWorkPackTemplates: React.FC<IndustryWorkPackTemplatesProps> = ({
  selectedIndustry,
  selectedProjectType,
  onSelectWorkPack,
  organizationId
}) => {
  const [workPacks, setWorkPacks] = useState<WorkPack[]>([]);
  const [customWorkPacks, setCustomWorkPacks] = useState<WorkPack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<'all' | 'budget' | 'standard' | 'premium'>('all');

  useEffect(() => {
    loadWorkPacks();
  }, [selectedIndustry, selectedProjectType, organizationId]);

  const loadWorkPacks = async () => {
    setIsLoading(true);
    
    // Get predefined work packs for the industry
    const industryKey = selectedIndustry; // This should map to industry slug
    const predefinedWorkPacks = INDUSTRY_WORK_PACKS[industryKey] || [];
    
    // Filter by project type if selected
    const filteredWorkPacks = selectedProjectType
      ? predefinedWorkPacks.filter(t => t.project_type_id === selectedProjectType)
      : predefinedWorkPacks;
    
    setWorkPacks(filteredWorkPacks);
    
    // Load custom organization work packs
    try {
      const workPacks = await WorkPackService.list(organizationId);
      const relevantPacks = workPacks.filter(pack => 
        pack.industry_id === selectedIndustry &&
        (!selectedProjectType || pack.project_type_id === selectedProjectType)
      );
      setCustomWorkPacks(relevantPacks);
    } catch (error) {
      console.error('Error loading custom work packs:', error);
    }
    
    setIsLoading(false);
  };

  const filteredWorkPacks = selectedTier === 'all' 
    ? workPacks 
    : workPacks.filter(t => t.tier === selectedTier);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'budget': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'standard': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'premium': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'budget': return '💰';
      case 'standard': return '⭐';
      case 'premium': return '👑';
      default: return '📦';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#fbbf24]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tier Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400">Filter by tier:</span>
        <div className="flex gap-2">
          {(['all', 'budget', 'standard', 'premium'] as const).map(tier => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors
                ${selectedTier === tier
                  ? 'bg-[#fbbf24] text-black'
                  : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#2a2a2a]'}`}
            >
              {tier === 'all' ? 'All Tiers' : (
                <>
                  {getTierIcon(tier)} {tier.charAt(0).toUpperCase() + tier.slice(1)}
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Work Packs Grid */}
      <div className="grid gap-4">
        {filteredWorkPacks.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No work packs available for this selection</p>
          </div>
        ) : (
          filteredWorkPacks.map(workPack => (
            <div
              key={workPack.id}
              className="bg-[#111] border border-[#2a2a2a] rounded-lg p-6 hover:border-[#3a3a3a] transition-all cursor-pointer"
              onClick={() => onSelectWorkPack(workPack)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    {workPack.name}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTierColor(workPack.tier)}`}>
                      {getTierIcon(workPack.tier)} {workPack.tier}
                    </span>
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">{workPack.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#fbbf24]">
                    {formatCurrency(workPack.base_price)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {workPack.estimated_hours} hours • {workPack.typical_duration_days} days
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mt-4">
                {/* Included Items */}
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Included</h4>
                  <ul className="space-y-1">
                    {workPack.included_items.slice(0, 3).map((item, index) => (
                      <li key={index} className="text-xs text-gray-500 flex items-start gap-1">
                        <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                    {workPack.included_items.length > 3 && (
                      <li className="text-xs text-gray-600">
                        +{workPack.included_items.length - 3} more items
                      </li>
                    )}
                  </ul>
                </div>

                {/* Key Tasks */}
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Key Tasks</h4>
                  <ul className="space-y-1">
                    {workPack.key_tasks.slice(0, 3).map((task, index) => (
                      <li key={index} className="text-xs text-gray-500">
                        • {task}
                      </li>
                    ))}
                    {workPack.key_tasks.length > 3 && (
                      <li className="text-xs text-gray-600">
                        +{workPack.key_tasks.length - 3} more tasks
                      </li>
                    )}
                  </ul>
                </div>

                {/* Permits */}
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Required Permits</h4>
                  <ul className="space-y-1">
                    {workPack.required_permits.map((permit, index) => (
                      <li key={index} className="text-xs text-gray-500">
                        📋 {permit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#2a2a2a] flex items-center justify-between">
                <button className="text-sm text-[#fbbf24] hover:text-[#f59e0b] flex items-center gap-1">
                  Use this work pack
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Custom Work Packs Section */}
      {customWorkPacks.length > 0 && (
        <>
          <div className="border-t border-[#2a2a2a] pt-6 mt-8">
            <h3 className="text-lg font-semibold text-white mb-4">Your Custom Work Packs</h3>
            <div className="grid gap-4">
              {customWorkPacks.map(pack => (
                <div
                  key={pack.id}
                  className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-4 hover:border-[#2a2a2a] transition-all cursor-pointer"
                  onClick={() => onSelectWorkPack(pack)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">{pack.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{pack.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-[#fbbf24]">
                        {formatCurrency(pack.base_price)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {pack.items?.length || 0} items • {pack.tasks?.length || 0} tasks
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};