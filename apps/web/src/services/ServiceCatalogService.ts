import { supabase } from '../lib/supabase';
import { ActivityLogService } from './ActivityLogService';

// Service Types
export interface Service {
  id: string;
  organization_id?: string;
  name: string;
  description?: string;
  category: 'installation' | 'repair' | 'maintenance' | 'inspection' | 'consultation' | 'preparation' | 'finishing';
  icon?: string;
  industry_id?: string;
  industry_name?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  // Computed fields
  option_count?: number;
  min_price?: number;
  max_price?: number;
  avg_price?: number;
  total_materials_count?: number;
  options?: ServiceOption[];
}

export interface ServiceOption {
  id: string;
  service_id: string;
  organization_id?: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  estimated_hours?: number;
  materials_list?: string[];
  skill_level?: 'basic' | 'intermediate' | 'advanced' | 'expert';
  material_quality?: 'economy' | 'standard' | 'premium' | 'luxury';
  warranty_months?: number;
  is_active: boolean;
  is_popular: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  attributes?: Record<string, any>; // JSONB field for industry-specific attributes
  // Related data
  service?: Service;
}

export interface ServicePackage {
  id: string;
  organization_id?: string;
  name: string;
  description?: string;
  level: 'essentials' | 'complete' | 'deluxe';
  base_price?: number;
  industry_id?: string;
  industry_name?: string;
  project_duration_days?: number;
  ideal_for?: string[];
  includes_warranty: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  // Computed fields from view
  item_count?: number;
  required_item_count?: number;
  total_item_count?: number;
  optional_item_count?: number;
  upgrade_item_count?: number;
  calculated_price?: number;
  package_price?: number;
  optional_items_value?: number;
  upgrade_items_value?: number;
  total_potential_value?: number;
  items?: ServicePackageItem[];
}

export interface ServicePackageItem {
  id: string;
  package_id: string;
  service_option_id: string;
  quantity: number;
  is_optional: boolean;
  is_upgrade: boolean;
  display_order: number;
  notes?: string;
  // Related data
  service_option?: ServiceOption;
}

export class ServiceCatalogService {
  /**
   * List all services for an organization
   */
  static async listServices(organizationId: string): Promise<Service[]> {
    console.log('ServiceCatalogService.listServices called with org:', organizationId);
    
    // First, let's check what industries are selected for this org
    const { data: orgIndustries, error: indError } = await supabase
      .from('organization_industries')
      .select('industry_id, industries(name)')
      .eq('organization_id', organizationId);
    
    if (!indError && orgIndustries) {
      console.log('Organization has these industries selected:', 
        orgIndustries.map((oi: any) => oi.industries?.name).join(', '),
        `(${orgIndustries.length} total)`
      );
    }
    
    const { data, error } = await supabase
      .rpc('get_organization_services', { 
        p_organization_id: organizationId 
      });

    if (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
    
    // Map the service_industry_id back to industry_id for the interface
    const services = (data || []).map((service: any) => ({
      ...service,
      industry_id: service.service_industry_id || service.industry_id
    }));
    
    console.log('ServiceCatalogService returned:', services.length, 'services');
    
    // Log which industries have services
    const industriesWithServices = new Set(services.map((s: Service) => s.industry_name));
    console.log('Industries with services:', Array.from(industriesWithServices).join(', '));
    
    return services;
  }

  /**
   * Get a single service with all its options
   */
  static async getServiceWithOptions(serviceId: string): Promise<Service & { options: ServiceOption[] }> {
    // Get service details
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select(`
        *,
        industry:industries(id, name)
      `)
      .eq('id', serviceId)
      .single();

    if (serviceError) throw serviceError;

    // Get service options
    const { data: options, error: optionsError } = await supabase
      .from('service_options')
      .select('*')
      .eq('service_id', serviceId)
      .eq('is_active', true)
      .order('display_order');

    if (optionsError) throw optionsError;

    return {
      ...service,
      industry_name: service.industry?.name,
      options: options || []
    };
  }

  /**
   * Create a new service
   */
  static async createService(service: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<Service> {
    const { data, error } = await supabase
      .from('services')
      .insert({
        ...service,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await ActivityLogService.log({
      organizationId: service.organization_id!,
      entityType: 'service',
      entityId: data.id,
      action: 'created',
      description: `created service "${data.name}"`,
      metadata: {
        category: data.category,
        industry_id: data.industry_id
      }
    });

    return data;
  }

  /**
   * Create a new service option
   */
  static async createServiceOption(option: Omit<ServiceOption, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceOption> {
    const { data, error } = await supabase
      .from('service_options')
      .insert(option)
      .select()
      .single();

    if (error) throw error;

    // Get service name for logging
    const { data: service } = await supabase
      .from('services')
      .select('name')
      .eq('id', option.service_id)
      .single();

    // Log activity
    await ActivityLogService.log({
      organizationId: option.organization_id!,
      entityType: 'service_option',
      entityId: data.id,
      action: 'created',
      description: `created option "${data.name}" for service "${service?.name}"`,
      metadata: {
        service_id: option.service_id,
        price: data.price,
        material_quality: data.material_quality
      }
    });

    return data;
  }

  /**
   * Update a service option
   */
  static async updateServiceOption(
    id: string, 
    updates: Partial<ServiceOption>
  ): Promise<ServiceOption> {
    const { data: current } = await supabase
      .from('service_options')
      .select('*')
      .eq('id', id)
      .single();

    const { data, error } = await supabase
      .from('service_options')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Build change metadata
    const changes: Record<string, any> = {};
    if (updates.name && updates.name !== current?.name) {
      changes.old_name = current?.name;
      changes.new_name = updates.name;
    }
    if (updates.price !== undefined && updates.price !== current?.price) {
      changes.old_price = current?.price;
      changes.new_price = updates.price;
    }

    // Log activity
    await ActivityLogService.log({
      organizationId: data.organization_id!,
      entityType: 'service_option',
      entityId: id,
      action: 'updated',
      description: `updated service option "${data.name}"`,
      metadata: changes
    });

    return data;
  }

  /**
   * List all service packages for an organization
   */
  static async listPackages(organizationId: string): Promise<ServicePackage[]> {
    const { data, error } = await supabase
      .from('service_package_details')
      .select('*')
      .or(`organization_id.eq.${organizationId},organization_id.is.null`)
      .order('level', { ascending: true })
      .order('display_order');

    if (error) throw error;

    return data || [];
  }

  /**
   * Get a single package with all items
   */
  static async getPackageWithItems(packageId: string): Promise<ServicePackage & { items: ServicePackageItem[] }> {
    // Get package details
    const { data: pkg, error: pkgError } = await supabase
      .from('service_packages')
      .select(`
        *,
        industry:industries(id, name)
      `)
      .eq('id', packageId)
      .single();

    if (pkgError) throw pkgError;

    // Get package items with service option details
    const { data: items, error: itemsError } = await supabase
      .from('service_package_items')
      .select(`
        *,
        service_option:service_options(*)
      `)
      .eq('package_id', packageId)
      .order('display_order');

    if (itemsError) throw itemsError;

    return {
      ...pkg,
      industry_name: pkg.industry?.name,
      items: items || []
    };
  }

  /**
   * Create a new service package
   */
  static async createPackage(
    pkg: Omit<ServicePackage, 'id' | 'created_at' | 'updated_at'> & {
      items?: Array<{
        service_option_id: string;
        quantity: number;
        is_optional?: boolean;
        is_upgrade?: boolean;
        notes?: string;
      }>;
    }
  ): Promise<ServicePackage> {
    const { items, ...packageData } = pkg;

    // Create the package
    const { data: newPackage, error: pkgError } = await supabase
      .from('service_packages')
      .insert({
        ...packageData,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (pkgError) throw pkgError;

    // Add items if provided
    if (items && items.length > 0) {
      const packageItems = items.map((item, index) => ({
        ...item,
        package_id: newPackage.id,
        display_order: index
      }));

      const { error: itemsError } = await supabase
        .from('service_package_items')
        .insert(packageItems);

      if (itemsError) throw itemsError;
    }

    // Log activity
    await ActivityLogService.log({
      organizationId: pkg.organization_id!,
      entityType: 'service_package',
      entityId: newPackage.id,
      action: 'created',
      description: `created ${newPackage.level} package "${newPackage.name}"`,
      metadata: {
        level: newPackage.level,
        item_count: items?.length || 0,
        base_price: newPackage.base_price
      }
    });

    return newPackage;
  }

  /**
   * Add a service option to a package
   */
  static async addOptionToPackage(
    packageId: string,
    optionId: string,
    quantity: number = 1,
    options: {
      is_optional?: boolean;
      is_upgrade?: boolean;
      notes?: string;
    } = {}
  ): Promise<void> {
    // Get next display order
    const { data: existing } = await supabase
      .from('service_package_items')
      .select('display_order')
      .eq('package_id', packageId)
      .order('display_order', { ascending: false })
      .limit(1);

    const nextOrder = existing && existing.length > 0 
      ? (existing[0].display_order + 1) 
      : 0;

    // Add the item
    const { error } = await supabase
      .from('service_package_items')
      .insert({
        package_id: packageId,
        service_option_id: optionId,
        quantity,
        display_order: nextOrder,
        ...options
      });

    if (error) throw error;

    // Get names for logging
    const [{ data: pkg }, { data: option }] = await Promise.all([
      supabase.from('service_packages').select('name, organization_id').eq('id', packageId).single(),
      supabase.from('service_options').select('name').eq('id', optionId).single()
    ]);

    // Log activity
    await ActivityLogService.log({
      organizationId: pkg?.organization_id!,
      entityType: 'service_package',
      entityId: packageId,
      action: 'updated',
      description: `added option "${option?.name}" to package "${pkg?.name}"`,
      metadata: {
        option_id: optionId,
        quantity,
        is_optional: options.is_optional,
        is_upgrade: options.is_upgrade
      }
    });
  }

  /**
   * Compare service options
   */
  static async compareOptions(optionIds: string[]): Promise<ServiceOption[]> {
    const { data, error } = await supabase
      .from('service_options')
      .select(`
        *,
        service:services(name, category)
      `)
      .in('id', optionIds);

    if (error) throw error;

    return data || [];
  }

  /**
   * Get popular service options
   */
  static async getPopularOptions(organizationId: string, limit: number = 10): Promise<ServiceOption[]> {
    const { data, error } = await supabase
      .from('service_options')
      .select(`
        *,
        service:services(name, category)
      `)
      .or(`organization_id.eq.${organizationId},organization_id.is.null`)
      .eq('is_popular', true)
      .eq('is_active', true)
      .limit(limit);

    if (error) throw error;

    return data || [];
  }

  /**
   * Search services and options
   */
  static async search(organizationId: string, query: string): Promise<{
    services: Service[];
    options: ServiceOption[];
    packages: ServicePackage[];
  }> {
    const searchTerm = `%${query}%`;

    const [services, options, packages] = await Promise.all([
      // Search services
      supabase
        .from('services')
        .select('*')
        .or(`organization_id.eq.${organizationId},organization_id.is.null`)
        .ilike('name', searchTerm),
      
      // Search options
      supabase
        .from('service_options')
        .select(`
          *,
          service:services(name, category)
        `)
        .or(`organization_id.eq.${organizationId},organization_id.is.null`)
        .ilike('name', searchTerm),
      
      // Search packages
      supabase
        .from('service_packages')
        .select('*')
        .or(`organization_id.eq.${organizationId},organization_id.is.null`)
        .ilike('name', searchTerm)
    ]);

    return {
      services: services.data || [],
      options: options.data || [],
      packages: packages.data || []
    };
  }
}