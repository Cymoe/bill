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
      price: row.price,
      unit: row.unit,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
      cost_code: row.cost_code_name ? {
        name: row.cost_code_name,
        code: row.cost_code_code
      } : undefined
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