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
}

export class CostCodeService {
  /**
   * List all cost codes for an organization, filtered by organization's selected industries
   */
  static async list(organizationId: string): Promise<CostCode[]> {
    // Get organization's primary industry first
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('industry_id')
      .eq('id', organizationId)
      .single();
    
    if (orgError || !org) {
      console.error('Error fetching organization:', orgError);
      return [];
    }
    
    // Get additional industries from organization_industries
    const additionalIndustryIds = await IndustryService.getOrganizationIndustryIds(organizationId);
    
    // Combine primary and additional industries, removing duplicates
    const industryIds = org.industry_id 
      ? [...new Set([org.industry_id, ...additionalIndustryIds])]
      : additionalIndustryIds;
    
    // If no industries selected, return empty array
    if (industryIds.length === 0) {
      return [];
    }

    // Get template cost codes first
    const { data: templateCostCodes, error: templateError } = await supabase
      .from('cost_codes')
      .select('*')
      .is('organization_id', null)
      .in('industry_id', industryIds)
      .eq('is_active', true)
      .order('code', { ascending: true });

    if (templateError) {
      console.error('Error fetching template cost codes:', templateError);
      throw templateError;
    }

    // Get organization-specific cost codes (all of them, not filtered by industry)
    // This allows organizations to have custom codes outside their selected industries
    const { data: orgCostCodes, error: orgError } = await supabase
      .from('cost_codes')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('code', { ascending: true });

    if (orgError) {
      console.error('Error fetching organization cost codes:', orgError);
      throw orgError;
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

    // Sort by code to maintain consistent ordering
    return mergedCodes.sort((a, b) => a.code.localeCompare(b.code));
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