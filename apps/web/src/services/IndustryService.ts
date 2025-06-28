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

  /**
   * Get organization's subscription plan and industry limit
   */
  static async getOrganizationPlan(organizationId: string): Promise<{
    planName: string;
    industryLimit: number | null;
    currentCount: number;
    canAddMore: boolean;
  }> {
    // Get subscription plan and current industry count in parallel
    const [subscriptionResult, currentCountResult, primaryIndustryResult] = await Promise.all([
      supabase
        .from('organization_subscriptions')
        .select(`
          subscription_plans(name, industry_limit)
        `)
        .eq('organization_id', organizationId)
        .eq('status', 'active')
        .single(),
      
      supabase
        .from('organization_industries')
        .select('industry_id', { count: 'exact' })
        .eq('organization_id', organizationId),
      
      supabase
        .from('organizations')
        .select('industry_id')
        .eq('id', organizationId)
        .single()
    ]);

    if (subscriptionResult.error) {
      console.error('Error fetching organization subscription:', subscriptionResult.error);
      // Default to Free plan if no subscription found
      const currentCount = (currentCountResult.count || 0) + (primaryIndustryResult.data?.industry_id ? 1 : 0);
      return {
        planName: 'Free',
        industryLimit: 5,
        currentCount,
        canAddMore: currentCount < 5
      };
    }

    const plan = subscriptionResult.data.subscription_plans;
    const currentCount = (currentCountResult.count || 0) + (primaryIndustryResult.data?.industry_id ? 1 : 0);
    const industryLimit = plan.industry_limit;
    
    return {
      planName: plan.name,
      industryLimit,
      currentCount,
      canAddMore: industryLimit === null || currentCount < industryLimit
    };
  }

  /**
   * Get organization's industry limit (number or null for unlimited)
   */
  static async getOrganizationIndustryLimit(organizationId: string): Promise<number | null> {
    const { data, error } = await supabase
      .from('organization_subscriptions')
      .select(`
        subscription_plans(industry_limit)
      `)
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error('Error fetching organization industry limit:', error);
      // Default to Free plan limit
      return 5;
    }

    return data.subscription_plans.industry_limit;
  }

  /**
   * Count organization's total industries (including primary)
   */
  static async getOrganizationIndustryCount(organizationId: string): Promise<number> {
    const [additionalResult, primaryResult] = await Promise.all([
      supabase
        .from('organization_industries')
        .select('industry_id', { count: 'exact' })
        .eq('organization_id', organizationId),
      
      supabase
        .from('organizations')
        .select('industry_id')
        .eq('id', organizationId)
        .single()
    ]);

    const additionalCount = additionalResult.count || 0;
    const hasPrimary = primaryResult.data?.industry_id ? 1 : 0;
    
    return additionalCount + hasPrimary;
  }

  /**
   * Check if organization can add more industries
   */
  static async canAddMoreIndustries(organizationId: string): Promise<boolean> {
    const [limit, currentCount] = await Promise.all([
      this.getOrganizationIndustryLimit(organizationId),
      this.getOrganizationIndustryCount(organizationId)
    ]);

    // Unlimited plan (null limit)
    if (limit === null) return true;
    
    return currentCount < limit;
  }
}