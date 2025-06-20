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
}

export class CostCodeService {
  /**
   * List all cost codes for an organization, filtered by organization's selected industries
   */
  static async list(organizationId: string): Promise<CostCode[]> {
    console.log('CostCodeService.list called with organizationId:', organizationId);
    
    // Get organization's primary industry first
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('industry_id, name')
      .eq('id', organizationId)
      .single();
    
    if (orgError || !org) {
      console.error('Error fetching organization:', orgError);
      return [];
    }
    
    console.log('CostCodeService: Organization details:', { name: org.name, primary_industry_id: org.industry_id });
    
    // Get additional industries from organization_industries
    const additionalIndustryIds = await IndustryService.getOrganizationIndustryIds(organizationId);
    console.log('CostCodeService: Additional industry IDs from IndustryService:', additionalIndustryIds);
    
    // Combine primary and additional industries, removing duplicates
    const industryIds = org.industry_id 
      ? [...new Set([org.industry_id, ...additionalIndustryIds])]
      : additionalIndustryIds;
    
    console.log('CostCodeService: Combined industry IDs:', industryIds);
    
    // If no industries selected, return empty array
    if (industryIds.length === 0) {
      return [];
    }

    // Get template cost codes first
    console.log('CostCodeService: Querying template codes with industry_ids:', industryIds);
    console.log('CostCodeService: Industry IDs type:', typeof industryIds, 'is array:', Array.isArray(industryIds));
    
    // IMPORTANT: Only get template codes that match our industries
    const { data: templateCostCodes, error: templateError } = await supabase
      .from('cost_codes')
      .select(`
        *,
        industry:industries(id, name, icon, color)
      `)
      .is('organization_id', null)
      .in('industry_id', industryIds)
      .eq('is_active', true)
      .order('code', { ascending: true });

    if (templateError) {
      console.error('Error fetching template cost codes:', templateError);
      throw templateError;
    }
    
    console.log('CostCodeService: Found', templateCostCodes?.length || 0, 'template cost codes for industries');
    console.log('CostCodeService: Template codes sample:', templateCostCodes?.slice(0, 3).map(c => ({ code: c.code, industry_id: c.industry_id })));
    
    // Debug: Check if we're getting codes from other industries
    if (templateCostCodes && templateCostCodes.length > 0) {
      const otherIndustryCodes = templateCostCodes.filter(c => !industryIds.includes(c.industry_id));
      if (otherIndustryCodes.length > 0) {
        console.warn('CostCodeService: Found', otherIndustryCodes.length, 'codes from OTHER industries!');
        console.warn('CostCodeService: Sample of wrong codes:', otherIndustryCodes.slice(0, 3).map(c => ({ code: c.code, industry_id: c.industry_id })));
      }
    }

    // Get organization-specific cost codes (all of them, not filtered by industry)
    // This allows organizations to have custom codes outside their selected industries
    const { data: orgCostCodes, error: orgCodesError } = await supabase
      .from('cost_codes')
      .select(`
        *,
        industry:industries(id, name, icon, color)
      `)
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('code', { ascending: true });

    if (orgCodesError) {
      console.error('Error fetching organization cost codes:', orgCodesError);
      throw orgCodesError;
    }

    // Merge templates with org-specific codes
    // Organization codes override templates with the same code
    const mergedCodes = [...(templateCostCodes || [])];
    
    if (orgCostCodes && orgCostCodes.length > 0) {
      orgCostCodes.forEach(orgCode => {
        const index = mergedCodes.findIndex(template => template.code === orgCode.code);
        if (index >= 0) {
          // Override template with org-specific code
          mergedCodes[index] = orgCode;
        } else {
          // Add new org-specific code that doesn't exist in templates
          mergedCodes.push(orgCode);
        }
      });
    }

    // Sort by industry name first, then by code
    return mergedCodes.sort((a, b) => {
      // First sort by industry name
      const industryA = a.industry?.name || 'Unknown';
      const industryB = b.industry?.name || 'Unknown';
      const industryCompare = industryA.localeCompare(industryB);
      
      // If same industry, sort by code
      if (industryCompare === 0) {
        return a.code.localeCompare(b.code);
      }
      
      return industryCompare;
    });
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