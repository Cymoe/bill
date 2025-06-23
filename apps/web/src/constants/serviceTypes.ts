export interface ServiceType {
  value: string;
  label: string;
  description: string;
  icon?: string;
  color?: string;
}

export const SERVICE_TYPES: ServiceType[] = [
  {
    value: 'installation',
    label: 'Installation',
    description: 'Installing fixtures, systems, or components',
    icon: 'Package',
    color: 'purple'
  },
  {
    value: 'service_call',
    label: 'Service Calls',
    description: 'Individual services and quick fixes',
    icon: 'Wrench',
    color: 'blue'
  },
  {
    value: 'repair',
    label: 'Repairs',
    description: 'Fix and repair services',
    icon: 'Tool',
    color: 'orange'
  },
  {
    value: 'maintenance',
    label: 'Maintenance',
    description: 'Preventive and recurring services',
    icon: 'RefreshCw',
    color: 'green'
  },
  {
    value: 'inspection',
    label: 'Inspections',
    description: 'Diagnostic and assessment services',
    icon: 'Search',
    color: 'teal'
  },
  {
    value: 'preparation',
    label: 'Preparation',
    description: 'Demo, prep work, and rough-ins',
    icon: 'Hammer',
    color: 'amber'
  },
  {
    value: 'finishing',
    label: 'Finishing',
    description: 'Paint, trim, and final touches',
    icon: 'Paintbrush',
    color: 'cyan'
  },
  {
    value: 'material',
    label: 'Materials',
    description: 'Parts and supplies only',
    icon: 'Box',
    color: 'gray'
  },
  {
    value: 'equipment_rental',
    label: 'Equipment Rental',
    description: 'Tools and equipment for rent',
    icon: 'Truck',
    color: 'indigo'
  },
  {
    value: 'subcontractor',
    label: 'Subcontractor',
    description: 'Specialized contractor services',
    icon: 'Users',
    color: 'pink'
  },
  {
    value: 'consultation',
    label: 'Consultation',
    description: 'Design, planning, and advisory services',
    icon: 'MessageCircle',
    color: 'violet'
  }
];

export const getServiceTypeLabel = (value: string): string => {
  const type = SERVICE_TYPES.find(t => t.value === value);
  return type?.label || value;
};

export const getServiceTypeIcon = (value: string): string => {
  const type = SERVICE_TYPES.find(t => t.value === value);
  return type?.icon || 'Package';
};

export const getServiceTypeColor = (value: string): string => {
  const type = SERVICE_TYPES.find(t => t.value === value);
  return type?.color || 'gray';
};