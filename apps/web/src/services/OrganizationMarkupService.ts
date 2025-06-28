import { supabase } from '../lib/supabase';
import { ActivityLogService } from './ActivityLogService';

export type MarkupCategory = 'labor' | 'materials' | 'services' | 'subcontractor';

export interface MarkupRule {
  id: string;
  organization_id: string;
  category: MarkupCategory;
  markup_percentage: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MarkupRuleUpdate {
  category: MarkupCategory;
  markup_percentage: number;
  is_active?: boolean;
}

export class OrganizationMarkupService {
  /**
   * Get all markup rules for an organization
   */
  static async getMarkupRules(organizationId: string): Promise<MarkupRule[]> {
    const { data, error } = await supabase
      .from('organization_markup_rules')
      .select('*')
      .eq('organization_id', organizationId)
      .order('category');

    if (error) {
      console.error('Error fetching markup rules:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get a specific markup rule by category
   */
  static async getMarkupRuleByCategory(
    organizationId: string, 
    category: MarkupCategory
  ): Promise<MarkupRule | null> {
    const { data, error } = await supabase
      .from('organization_markup_rules')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('category', category)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching markup rule:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update or create a markup rule for a category
   */
  static async upsertMarkupRule(
    organizationId: string,
    rule: MarkupRuleUpdate
  ): Promise<MarkupRule> {
    const { data, error } = await supabase
      .from('organization_markup_rules')
      .upsert({
        organization_id: organizationId,
        category: rule.category,
        markup_percentage: rule.markup_percentage,
        is_active: rule.is_active ?? true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'organization_id,category'
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting markup rule:', error);
      throw error;
    }

    // Log activity
    await ActivityLogService.log({
      organizationId,
      entityType: 'markup_rule',
      entityId: data.id,
      action: 'update',
      description: `Updated ${rule.category} markup to ${rule.markup_percentage}%`
    });

    return data;
  }

  /**
   * Bulk update all markup rules for an organization
   */
  static async updateAllMarkupRules(
    organizationId: string,
    rules: MarkupRuleUpdate[]
  ): Promise<MarkupRule[]> {
    const upsertData = rules.map(rule => ({
      organization_id: organizationId,
      category: rule.category,
      markup_percentage: rule.markup_percentage,
      is_active: rule.is_active ?? true,
      updated_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('organization_markup_rules')
      .upsert(upsertData, {
        onConflict: 'organization_id,category'
      })
      .select();

    if (error) {
      console.error('Error updating markup rules:', error);
      throw error;
    }

    // Log activity
    await ActivityLogService.log({
      organizationId,
      entityType: 'markup_rules',
      entityId: 'bulk',
      action: 'update',
      description: `Updated ${rules.length} markup rules`
    });

    return data || [];
  }

  /**
   * Calculate markup for a given cost and category
   */
  static async calculateMarkup(
    organizationId: string,
    category: MarkupCategory,
    cost: number
  ): Promise<{ cost: number; markup: number; price: number; markupPercentage: number }> {
    const rule = await this.getMarkupRuleByCategory(organizationId, category);
    const markupPercentage = rule?.is_active ? (rule.markup_percentage || 0) : 0;
    const markup = cost * (markupPercentage / 100);
    const price = cost + markup;

    return {
      cost,
      markup,
      price,
      markupPercentage
    };
  }

  /**
   * Get category for a cost code number
   */
  static getCategoryFromCostCode(costCodeNumber: number): MarkupCategory {
    if (costCodeNumber >= 100 && costCodeNumber <= 199) {
      return 'labor';
    } else if (costCodeNumber >= 500 && costCodeNumber <= 599) {
      return 'materials';
    } else if (costCodeNumber >= 700 && costCodeNumber <= 799) {
      return 'subcontractor';
    } else {
      return 'services';
    }
  }

  /**
   * Calculate markup for a line item based on its cost code
   */
  static async calculateLineItemMarkup(
    organizationId: string,
    lineItemId: string,
    cost: number
  ): Promise<{ cost: number; markup: number; price: number; markupPercentage: number; category: MarkupCategory }> {
    // Get the line item's cost code
    const { data: lineItem, error } = await supabase
      .from('line_items')
      .select(`
        id,
        cost_code:cost_codes(code)
      `)
      .eq('id', lineItemId)
      .single();

    if (error) {
      console.error('Error fetching line item:', error);
      throw error;
    }

    // Extract the numeric part of the cost code
    const costCodeNumber = parseInt(lineItem.cost_code.code.replace(/[^0-9]/g, ''));
    const category = this.getCategoryFromCostCode(costCodeNumber);

    // Calculate markup based on category
    const result = await this.calculateMarkup(organizationId, category, cost);
    return { ...result, category };
  }

  /**
   * Initialize default markup rules for a new organization
   */
  static async initializeDefaultRules(organizationId: string): Promise<void> {
    const defaultRules: MarkupRuleUpdate[] = [
      { category: 'labor', markup_percentage: 40 },
      { category: 'materials', markup_percentage: 25 },
      { category: 'services', markup_percentage: 35 },
      { category: 'subcontractor', markup_percentage: 15 }
    ];

    await this.updateAllMarkupRules(organizationId, defaultRules);
  }
}