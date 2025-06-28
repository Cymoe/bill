import { supabase } from '../lib/supabase';
import { ActivityLogService } from './ActivityLogService';
import { LineItem } from '../types';

export class LineItemService {
  /**
   * List all line items available to an organization based on their industries
   * Line items are tied to cost codes, which are tied to industries
   */
  static async list(organizationId: string): Promise<LineItem[]> {
    // Use the optimized database function
    const { data, error } = await supabase
      .rpc('get_organization_line_items', { 
        p_organization_id: organizationId 
      });

    if (error) {
      console.error('Error fetching line items:', error);
      throw error;
    }

    // Transform the data to match our LineItem interface
    const lineItems: LineItem[] = (data || []).map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      cost_code_id: row.cost_code_id,
      price: row.price, // This is already the override price if one exists
      unit: row.unit,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
      organization_id: row.organization_id,
      user_id: row.user_id || '', // Add user_id field
      cost_code: row.cost_code_name ? {
        name: row.cost_code_name,
        code: row.cost_code_code
      } : undefined,
      // Add these for UI display
      base_price: row.base_price,
      has_override: row.has_override,
      markup_percentage: row.markup_percentage,
      margin_percentage: row.margin_percentage
    }));

    return lineItems;
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
   * Update an existing line item (only if owned by the organization)
   */
  static async update(id: string, updates: Partial<LineItem>, organizationId?: string): Promise<LineItem> {
    // First, check if the line item exists and get its organization_id
    const { data: existingItem, error: fetchError } = await supabase
      .from('line_items')
      .select('organization_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching line item:', fetchError);
      throw new Error('Line item not found');
    }

    // Check ownership - only allow updates if:
    // 1. The line item belongs to the user's organization
    // 2. The user is trying to update their own custom line item
    if (!existingItem.organization_id) {
      throw new Error('Cannot edit shared industry-standard line items. Use "Customize Pricing" instead.');
    }

    if (organizationId && existingItem.organization_id !== organizationId) {
      throw new Error('You can only edit line items owned by your organization');
    }

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
      organizationId: existingItem.organization_id || 'system',
      entityType: 'line_item',
      entityId: id,
      action: 'update',
      description: `Updated line item "${data.name}"`
    });

    return data;
  }

  /**
   * Delete a line item (only if owned by the organization)
   */
  static async delete(id: string, organizationId?: string): Promise<void> {
    // Get the line item first for validation and logging
    const lineItem = await this.getById(id);
    
    if (!lineItem) {
      throw new Error('Line item not found');
    }

    // Check ownership - only allow deletion if:
    // 1. The line item belongs to the user's organization
    if (!lineItem.organization_id) {
      throw new Error('Cannot delete shared industry-standard line items');
    }

    if (organizationId && lineItem.organization_id !== organizationId) {
      throw new Error('You can only delete line items owned by your organization');
    }
    
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
      organizationId: lineItem.organization_id || 'system',
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

  /**
   * Create or update a price override for a shared line item
   */
  static async setOverridePrice(lineItemId: string, organizationId: string, customPrice: number): Promise<void> {
    const { error } = await supabase
      .from('line_item_overrides')
      .upsert({
        line_item_id: lineItemId,
        organization_id: organizationId,
        custom_price: customPrice,
        markup_percentage: null, // Clear markup when setting custom price
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'organization_id,line_item_id'
      });

    if (error) {
      console.error('Error setting override price:', error);
      throw error;
    }

    // Log activity
    await ActivityLogService.log({
      organizationId: organizationId,
      entityType: 'line_item_override',
      entityId: lineItemId,
      action: 'update',
      description: `Set custom price to ${customPrice}`
    });
  }

  /**
   * Set markup percentage for a line item
   */
  static async setMarkupPercentage(lineItemId: string, organizationId: string, markupPercentage: number): Promise<void> {
    const { error } = await supabase
      .from('line_item_overrides')
      .upsert({
        line_item_id: lineItemId,
        organization_id: organizationId,
        markup_percentage: markupPercentage,
        custom_price: null, // Clear custom price when setting markup
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'organization_id,line_item_id'
      });

    if (error) {
      console.error('Error setting markup percentage:', error);
      throw error;
    }

    // Log activity
    await ActivityLogService.log({
      organizationId: organizationId,
      entityType: 'line_item_override',
      entityId: lineItemId,
      action: 'update',
      description: `Set markup to ${markupPercentage}%`
    });
  }

  /**
   * Remove a price override, reverting to industry standard
   */
  static async removeOverridePrice(lineItemId: string, organizationId: string): Promise<void> {
    const { error } = await supabase
      .from('line_item_overrides')
      .delete()
      .eq('line_item_id', lineItemId)
      .eq('organization_id', organizationId);

    if (error) {
      console.error('Error removing override price:', error);
      throw error;
    }

    // Log activity
    await ActivityLogService.log({
      organizationId: organizationId,
      entityType: 'line_item_override',
      entityId: lineItemId,
      action: 'delete',
      description: 'Reverted to industry standard pricing'
    });
  }

  /**
   * Get all price overrides for an organization
   */
  static async getOrganizationOverrides(organizationId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('line_item_overrides')
      .select(`
        *,
        line_item:line_items(name, price, unit)
      `)
      .eq('organization_id', organizationId);

    if (error) {
      console.error('Error fetching organization overrides:', error);
      throw error;
    }

    return data || [];
  }
}