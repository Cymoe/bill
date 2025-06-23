import { supabase } from '../lib/supabase';
import { Industry } from '../types';

export class IndustryService {
  /**
   * Get all industries
   */
  static async listAll(): Promise<Industry[]> {
    const { data, error } = await supabase
      .from('industries')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching industries:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get organization's selected industries
   */
  static async getOrganizationIndustries(organizationId: string): Promise<Industry[]> {
    const { data, error } = await supabase
      .from('organization_industries')
      .select(`
        industry:industries(*)
      `)
      .eq('organization_id', organizationId);

    if (error) {
      console.error('Error fetching organization industries:', error);
      throw error;
    }

    return data?.map(item => item.industry).filter(Boolean) || [];
  }

  /**
   * Get organization's selected industry IDs
   */
  static async getOrganizationIndustryIds(organizationId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('organization_industries')
      .select('industry_id')
      .eq('organization_id', organizationId);

    if (error) {
      console.error('Error fetching organization industry IDs:', error);
      throw error;
    }

    return data?.map(item => item.industry_id) || [];
  }

  /**
   * Add industry to organization
   */
  static async addToOrganization(organizationId: string, industryId: string): Promise<void> {
    const { error } = await supabase
      .from('organization_industries')
      .insert([{ organization_id: organizationId, industry_id: industryId }]);

    if (error) {
      console.error('Error adding industry to organization:', error);
      throw error;
    }
  }

  /**
   * Remove industry from organization
   */
  static async removeFromOrganization(organizationId: string, industryId: string): Promise<void> {
    const { error } = await supabase
      .from('organization_industries')
      .delete()
      .eq('organization_id', organizationId)
      .eq('industry_id', industryId);

    if (error) {
      console.error('Error removing industry from organization:', error);
      throw error;
    }
  }

  /**
   * Set organization industries (replaces all existing)
   */
  static async setOrganizationIndustries(organizationId: string, industryIds: string[]): Promise<void> {
    // Remove all existing
    await supabase
      .from('organization_industries')
      .delete()
      .eq('organization_id', organizationId);

    // Add new ones
    if (industryIds.length > 0) {
      const { error } = await supabase
        .from('organization_industries')
        .insert(
          industryIds.map(industryId => ({
            organization_id: organizationId,
            industry_id: industryId
          }))
        );

      if (error) {
        console.error('Error setting organization industries:', error);
        throw error;
      }
    }
  }
}