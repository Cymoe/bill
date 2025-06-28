import { supabase } from '../lib/supabase';
import { IndustryService } from './IndustryService';

export interface CostCode {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: 'labor' | 'material' | 'equipment' | 'subcontractor' | 'service';
  organization_id?: string;
  industry_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  industry?: {
    id: string;
    name: string;
    icon?: string;
    color?: string;
  };
  item_count?: number;
}

export class CostCodeService {
  /**
   * List all cost codes for an organization, filtered by organization's selected industries
   */
  static async list(organizationId: string): Promise<CostCode[]> {
    // console.log('CostCodeService.list called with organizationId:', organizationId);
    
    // Use the optimized database function
    const { data, error } = await supabase
      .rpc('get_organization_cost_codes', { 
        p_organization_id: organizationId 
      });

    if (error) {
      console.error('Error fetching cost codes:', error);
      throw error;
    }

    // console.log('RPC returned data:', data?.length || 0, 'cost codes');
    // console.log('Sample RPC data:', data?.[0]);

    // Transform the data to match our CostCode interface
    const costCodes: CostCode[] = (data || []).map(row => ({
      id: row.id,
      code: row.code,
      name: row.name,
      description: row.description,
      category: row.category as 'labor' | 'material' | 'equipment' | 'subcontractor' | 'service',
      organization_id: row.organization_id,
      industry_id: row.industry_id,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
      industry: row.industry_name ? {
        id: row.industry_id,
        name: row.industry_name,
        icon: row.industry_icon,
        color: row.industry_color
      } : undefined,
      item_count: row.item_count
    }));
    
    return costCodes;
  }

  /**
   * List all cost codes for an organization, grouped by industry
   */
  static async listGroupedByIndustry(organizationId: string): Promise<Map<string, CostCode[]>> {
    const costCodes = await this.list(organizationId);
    
    const grouped = new Map<string, CostCode[]>();
    
    costCodes.forEach(code => {
      const industryName = code.industry?.name || 'Unknown Industry';
      if (!grouped.has(industryName)) {
        grouped.set(industryName, []);
      }
      grouped.get(industryName)!.push(code);
    });
    
    return grouped;
  }

  /**
   * Get a single cost code by ID
   */
  static async getById(id: string): Promise<CostCode | null> {
    const { data, error } = await supabase
      .from('cost_codes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching cost code:', error);
      throw error;
    }

    return data;
  }

  /**
   * Create a new cost code
   */
  static async create(costCode: Omit<CostCode, 'id' | 'created_at' | 'updated_at'>): Promise<CostCode> {
    const { data, error } = await supabase
      .from('cost_codes')
      .insert([costCode])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating cost code:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update an existing cost code
   */
  static async update(id: string, updates: Partial<CostCode>): Promise<CostCode> {
    const { data, error } = await supabase
      .from('cost_codes')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating cost code:', error);
      throw error;
    }

    return data;
  }

  /**
   * Delete a cost code
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('cost_codes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting cost code:', error);
      throw error;
    }
  }

  /**
   * Search cost codes by name or code
   */
  static async search(organizationId: string, query: string): Promise<CostCode[]> {
    // Get organization's selected industry IDs
    const industryIds = await IndustryService.getOrganizationIndustryIds(organizationId);
    
    // If no industries selected, return empty array
    if (industryIds.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from('cost_codes')
      .select('*')
      .eq('organization_id', organizationId)
      .in('industry_id', industryIds)
      .or(`name.ilike.%${query}%,code.ilike.%${query}%,description.ilike.%${query}%`)
      .eq('is_active', true)
      .order('code', { ascending: true });

    if (error) {
      console.error('Error searching cost codes:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get cost codes by category
   */
  static async getByCategory(organizationId: string, category: string): Promise<CostCode[]> {
    // Get organization's selected industry IDs
    const industryIds = await IndustryService.getOrganizationIndustryIds(organizationId);
    
    // If no industries selected, return empty array
    if (industryIds.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from('cost_codes')
      .select('*')
      .eq('organization_id', organizationId)
      .in('industry_id', industryIds)
      .eq('category', category)
      .eq('is_active', true)
      .order('code', { ascending: true });

    if (error) {
      console.error('Error fetching cost codes by category:', error);
      throw error;
    }

    return data || [];
  }
}