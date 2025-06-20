import { supabase } from '../lib/supabase';
import { ActivityLogService } from './ActivityLogService';
import { LineItem } from '../types';

export class LineItemService {
  /**
   * List all line items available to an organization based on their industries
   * Line items are tied to cost codes, which are tied to industries
   */
  static async list(organizationId: string): Promise<LineItem[]> {
    // Get the organization's industries (primary + additional)
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('industry_id')
      .eq('id', organizationId)
      .single();

    if (orgError) {
      console.error('Error fetching organization:', orgError);
      throw orgError;
    }

    // Get additional industries
    const { data: orgIndustries, error: additionalError } = await supabase
      .from('organization_industries')
      .select('industry_id')
      .eq('organization_id', organizationId);

    if (additionalError) {
      console.error('Error fetching additional industries:', additionalError);
      throw additionalError;
    }

    // Combine all industry IDs
    const industryIds = orgIndustries?.map(oi => oi.industry_id) || [];
    if (org?.industry_id) {
      industryIds.push(org.industry_id);
    }
    
    const uniqueIndustryIds = [...new Set(industryIds)];
    
    if (uniqueIndustryIds.length === 0) {
      return [];
    }

    // Get all cost codes for these industries
    const { data: costCodes, error: costCodesError } = await supabase
      .from('cost_codes')
      .select('id')
      .in('industry_id', uniqueIndustryIds);

    if (costCodesError) {
      console.error('Error fetching cost codes:', costCodesError);
      throw costCodesError;
    }

    const costCodeIds = costCodes?.map(cc => cc.id) || [];
    
    if (costCodeIds.length === 0) {
      return [];
    }

    // Get all line items for these cost codes
    const { data: lineItems, error: lineItemsError } = await supabase
      .from('line_items')
      .select(`
        *,
        cost_code:cost_codes(name, code)
      `)
      .in('cost_code_id', costCodeIds)
      .order('name', { ascending: true });

    if (lineItemsError) {
      console.error('Error fetching line items:', lineItemsError);
      throw lineItemsError;
    }

    return lineItems || [];
  }

  /**
   * Get a single line item by ID
   */
  static async getById(id: string): Promise<LineItem | null> {
    const { data, error } = await supabase
      .from('line_items')
      .select(`
        *,
        cost_code:cost_codes(name, code)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching line item:', error);
      throw error;
    }

    return data;
  }

  /**
   * Create a new line item (admin only)
   */
  static async create(lineItem: Omit<LineItem, 'id' | 'created_at' | 'updated_at'>): Promise<LineItem> {
    const { data, error } = await supabase
      .from('line_items')
      .insert([lineItem])
      .select(`
        *,
        cost_code:cost_codes(name, code)
      `)
      .single();

    if (error) {
      console.error('Error creating line item:', error);
      throw error;
    }

    // Log activity
    await ActivityLogService.log({
      organizationId: 'system', // Since line items are now system-wide
      entityType: 'line_item',
      entityId: data.id,
      action: 'create',
      description: `Created line item "${data.name}"`
    });

    return data;
  }

  /**
   * Update an existing line item (admin only)
   */
  static async update(id: string, updates: Partial<LineItem>): Promise<LineItem> {
    const { data, error } = await supabase
      .from('line_items')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        cost_code:cost_codes(name, code)
      `)
      .single();

    if (error) {
      console.error('Error updating line item:', error);
      throw error;
    }

    // Log activity
    await ActivityLogService.log({
      organizationId: 'system',
      entityType: 'line_item',
      entityId: id,
      action: 'update',
      description: `Updated line item "${data.name}"`
    });

    return data;
  }

  /**
   * Delete a line item (admin only)
   */
  static async delete(id: string): Promise<void> {
    // Get the line item first for logging
    const lineItem = await this.getById(id);
    
    const { error } = await supabase
      .from('line_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting line item:', error);
      throw error;
    }

    // Log activity
    await ActivityLogService.log({
      organizationId: 'system',
      entityType: 'line_item',
      entityId: id,
      action: 'delete',
      description: `Deleted line item "${lineItem?.name}"`
    });
  }

  /**
   * Get line items by cost code
   */
  static async getByCostCode(costCodeId: string): Promise<LineItem[]> {
    const { data, error } = await supabase
      .from('line_items')
      .select(`
        *,
        cost_code:cost_codes(name, code)
      `)
      .eq('cost_code_id', costCodeId)
      .order('name');

    if (error) {
      console.error('Error fetching line items by cost code:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Bulk create line items (admin only)
   */
  static async bulkCreate(lineItems: Omit<LineItem, 'id' | 'created_at' | 'updated_at'>[]): Promise<LineItem[]> {
    const { data, error } = await supabase
      .from('line_items')
      .insert(lineItems)
      .select(`
        *,
        cost_code:cost_codes(name, code)
      `);

    if (error) {
      console.error('Error bulk creating line items:', error);
      throw error;
    }

    // Log activity
    await ActivityLogService.log({
      organizationId: 'system',
      entityType: 'line_item',
      entityId: 'bulk',
      action: 'create',
      description: `Bulk created ${lineItems.length} line items`
    });

    return data || [];
  }
}