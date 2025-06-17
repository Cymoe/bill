import { supabase } from '../lib/supabase';
import { ActivityLogService } from './ActivityLogService';

export interface Vendor {
  id: string;
  user_id: string;
  name: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  category: string;
  specialty?: string;
  notes?: string;
  rating?: number;
  is_preferred: boolean;
  license_number?: string;
  insurance_info?: string;
  tax_id?: string;
  payment_terms?: string;
  created_at: string;
  updated_at: string;
}

export interface VendorFormData {
  name: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  category: string;
  specialty?: string;
  notes?: string;
  rating?: number;
  is_preferred: boolean;
  license_number?: string;
  insurance_info?: string;
  tax_id?: string;
  payment_terms?: string;
}

export const VENDOR_CATEGORIES = [
  'Concrete',
  'Drywall', 
  'Electrical',
  'Equipment Rental',
  'Glass & Glazing',
  'Hardware & Fasteners',
  'HVAC',
  'Industrial Supplies',
  'Landscaping',
  'Lumber & Building Materials',
  'Masonry & Stone',
  'Metal Work',
  'Painting',
  'Plumbing',
  'Roofing',
  'Roofing & Siding',
  'Security Systems',
  'Tile & Flooring',
  'Tools & Equipment'
];

export class VendorService {
  /**
   * Get all vendors for the current organization
   */
  static async getVendors(organizationId: string): Promise<Vendor[]> {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('organization_id', organizationId)
      .order('is_preferred', { ascending: false })
      .order('name');

    if (error) throw error;
    return data || [];
  }

  /**
   * Get vendors by category
   */
  static async getVendorsByCategory(organizationId: string, category: string): Promise<Vendor[]> {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('category', category)
      .order('is_preferred', { ascending: false })
      .order('rating', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get preferred vendors
   */
  static async getPreferredVendors(organizationId: string): Promise<Vendor[]> {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_preferred', true)
      .order('category')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  /**
   * Get a single vendor by ID
   */
  static async getVendor(vendorId: string): Promise<Vendor | null> {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', vendorId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Create a new vendor
   */
  static async createVendor(organizationId: string, vendorData: VendorFormData): Promise<Vendor> {
    const { data, error } = await supabase
      .from('vendors')
      .insert({
        organization_id: organizationId,
        ...vendorData
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await ActivityLogService.log({
      organizationId,
      entityType: 'vendor',
      entityId: data.id,
      action: 'created',
      description: `created vendor ${data.name}`,
      metadata: {
        category: data.category,
        is_preferred: data.is_preferred,
        contact_name: data.contact_name || 'No contact',
        email: data.email || 'No email'
      }
    });

    return data;
  }

  /**
   * Update a vendor
   */
  static async updateVendor(vendorId: string, vendorData: Partial<VendorFormData>, organizationId: string): Promise<Vendor> {
    // Get current vendor for comparison
    const { data: currentVendor, error: fetchError } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', vendorId)
      .single();

    if (fetchError) throw fetchError;

    const { data, error } = await supabase
      .from('vendors')
      .update({
        ...vendorData,
        updated_at: new Date().toISOString()
      })
      .eq('id', vendorId)
      .select()
      .single();

    if (error) throw error;

    // Build metadata for what changed
    const metadata: Record<string, any> = {};
    if (vendorData.name && vendorData.name !== currentVendor.name) {
      metadata.old_name = currentVendor.name;
      metadata.new_name = vendorData.name;
    }
    if (vendorData.category && vendorData.category !== currentVendor.category) {
      metadata.old_category = currentVendor.category;
      metadata.new_category = vendorData.category;
    }
    if (vendorData.is_preferred !== undefined && vendorData.is_preferred !== currentVendor.is_preferred) {
      metadata.old_preferred = currentVendor.is_preferred;
      metadata.new_preferred = vendorData.is_preferred;
    }

    // Log activity
    await ActivityLogService.log({
      organizationId,
      entityType: 'vendor',
      entityId: vendorId,
      action: 'updated',
      description: `updated vendor ${data.name}`,
      metadata
    });

    return data;
  }

  /**
   * Delete a vendor
   */
  static async deleteVendor(vendorId: string, organizationId: string): Promise<void> {
    // Get vendor info before deletion
    const { data: vendor, error: fetchError } = await supabase
      .from('vendors')
      .select('name, category, contact_name')
      .eq('id', vendorId)
      .single();

    if (fetchError) throw fetchError;

    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', vendorId);

    if (error) throw error;

    // Log activity
    await ActivityLogService.log({
      organizationId,
      entityType: 'vendor',
      entityId: vendorId,
      action: 'deleted',
      description: `deleted vendor ${vendor.name}`,
      metadata: {
        name: vendor.name,
        category: vendor.category,
        contact_name: vendor.contact_name || 'No contact'
      }
    });
  }

  /**
   * Associate a vendor with a project
   */
  static async addVendorToProject(vendorId: string, projectId: string): Promise<void> {
    const { error } = await supabase
      .from('vendor_projects')
      .insert({
        vendor_id: vendorId,
        project_id: projectId
      });

    if (error && error.code !== '23505') { // Ignore unique violation
      throw error;
    }
  }

  /**
   * Remove vendor association from a project
   */
  static async removeVendorFromProject(vendorId: string, projectId: string): Promise<void> {
    const { error } = await supabase
      .from('vendor_projects')
      .delete()
      .eq('vendor_id', vendorId)
      .eq('project_id', projectId);

    if (error) throw error;
  }

  /**
   * Get all vendors associated with a project
   */
  static async getProjectVendors(projectId: string): Promise<Vendor[]> {
    const { data, error } = await supabase
      .from('vendor_projects')
      .select(`
        vendor:vendors(*)
      `)
      .eq('project_id', projectId);

    if (error) throw error;
    return data?.map((vp: any) => vp.vendor as Vendor).filter(Boolean) || [];
  }

  /**
   * Get vendor expenses
   */
  static async getVendorExpenses(vendorId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get vendor statistics
   */
  static async getVendorStats(vendorId: string): Promise<{
    totalSpent: number;
    projectCount: number;
    expenseCount: number;
    averageExpense: number;
  }> {
    // Get total spent
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select('amount')
      .eq('vendor_id', vendorId);

    if (expensesError) throw expensesError;

    const totalSpent = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
    const expenseCount = expenses?.length || 0;
    const averageExpense = expenseCount > 0 ? totalSpent / expenseCount : 0;

    // Get project count
    const { count: projectCount, error: projectError } = await supabase
      .from('vendor_projects')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_id', vendorId);

    if (projectError) throw projectError;

    return {
      totalSpent,
      projectCount: projectCount || 0,
      expenseCount,
      averageExpense
    };
  }
} 