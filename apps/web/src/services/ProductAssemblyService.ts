import { supabase } from '../lib/supabase';
import { ActivityLogService } from './ActivityLogService';
import { ProductAssembly, AssemblyLineItem } from '../types';

export class ProductAssemblyService {
  /**
   * List all product assemblies for an organization
   */
  static async list(organizationId: string): Promise<ProductAssembly[]> {
    const { data, error } = await supabase
      .from('product_assemblies')
      .select(`
        *,
        line_items:assembly_line_items(
          *,
          line_item:line_items(
            *,
            cost_code:cost_codes(name, code)
          )
        )
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching product assemblies:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get a single product assembly by ID with its line items
   */
  static async getById(id: string): Promise<ProductAssembly | null> {
    const { data, error } = await supabase
      .from('product_assemblies')
      .select(`
        *,
        line_items:assembly_line_items(
          *,
          line_item:line_items(
            *,
            cost_code:cost_codes(name, code)
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product assembly:', error);
      throw error;
    }

    return data;
  }

  /**
   * Create a new product assembly
   */
  static async create(assembly: Omit<ProductAssembly, 'id' | 'created_at' | 'updated_at'>): Promise<ProductAssembly> {
    const { data, error } = await supabase
      .from('product_assemblies')
      .insert([assembly])
      .select()
      .single();

    if (error) {
      console.error('Error creating product assembly:', error);
      throw error;
    }

    // Log activity
    if (assembly.organization_id) {
      await ActivityLogService.log({
        organization_id: assembly.organization_id,
        user_id: assembly.user_id,
        action: 'create',
        entity_type: 'product_assembly',
        entity_id: data.id,
        description: `Created product assembly "${data.name}"`
      });
    }

    return data;
  }

  /**
   * Update an existing product assembly
   */
  static async update(id: string, updates: Partial<ProductAssembly>): Promise<ProductAssembly> {
    const { data, error } = await supabase
      .from('product_assemblies')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product assembly:', error);
      throw error;
    }

    // Log activity
    if (data.organization_id) {
      await ActivityLogService.log({
        organization_id: data.organization_id,
        user_id: data.user_id,
        action: 'update',
        entity_type: 'product_assembly',
        entity_id: id,
        description: `Updated product assembly "${data.name}"`
      });
    }

    return data;
  }

  /**
   * Delete a product assembly and its line item relationships
   */
  static async delete(id: string): Promise<void> {
    // Get the assembly first for logging
    const assembly = await this.getById(id);
    
    const { error } = await supabase
      .from('product_assemblies')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product assembly:', error);
      throw error;
    }

    // Log activity
    if (assembly?.organization_id) {
      await ActivityLogService.log({
        organization_id: assembly.organization_id,
        user_id: assembly.user_id,
        action: 'delete',
        entity_type: 'product_assembly',
        entity_id: id,
        description: `Deleted product assembly "${assembly.name}"`
      });
    }
  }

  /**
   * Add a line item to an assembly
   */
  static async addLineItem(assemblyLineItem: Omit<AssemblyLineItem, 'id' | 'created_at' | 'updated_at'>): Promise<AssemblyLineItem> {
    const { data, error } = await supabase
      .from('assembly_line_items')
      .insert([assemblyLineItem])
      .select(`
        *,
        line_item:line_items(
          *,
          cost_code:cost_codes(name, code)
        )
      `)
      .single();

    if (error) {
      console.error('Error adding line item to assembly:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update a line item in an assembly
   */
  static async updateLineItem(id: string, updates: Partial<AssemblyLineItem>): Promise<AssemblyLineItem> {
    const { data, error } = await supabase
      .from('assembly_line_items')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        line_item:line_items(
          *,
          cost_code:cost_codes(name, code)
        )
      `)
      .single();

    if (error) {
      console.error('Error updating assembly line item:', error);
      throw error;
    }

    return data;
  }

  /**
   * Remove a line item from an assembly
   */
  static async removeLineItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('assembly_line_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error removing line item from assembly:', error);
      throw error;
    }
  }

  /**
   * Get assembly line items for a specific assembly
   */
  static async getAssemblyLineItems(assemblyId: string): Promise<AssemblyLineItem[]> {
    const { data, error } = await supabase
      .from('assembly_line_items')
      .select(`
        *,
        line_item:line_items(
          *,
          cost_code:cost_codes(name, code)
        )
      `)
      .eq('assembly_id', assemblyId)
      .order('display_order');

    if (error) {
      console.error('Error fetching assembly line items:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Calculate total price for an assembly based on its line items
   */
  static async calculateTotalPrice(assemblyId: string): Promise<number> {
    const lineItems = await this.getAssemblyLineItems(assemblyId);
    
    return lineItems.reduce((total, item) => {
      const price = item.price_override || item.line_item?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  }

  /**
   * Search product assemblies
   */
  static async search(organizationId: string, query: string): Promise<ProductAssembly[]> {
    const { data, error } = await supabase
      .from('product_assemblies')
      .select(`
        *,
        line_items:assembly_line_items(
          *,
          line_item:line_items(
            *,
            cost_code:cost_codes(name, code)
          )
        )
      `)
      .eq('organization_id', organizationId)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching product assemblies:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Duplicate an assembly with all its line items
   */
  static async duplicate(id: string, newName: string): Promise<ProductAssembly> {
    const original = await this.getById(id);
    if (!original) {
      throw new Error('Assembly not found');
    }

    // Create new assembly
    const { line_items, ...assemblyData } = original;
    const newAssembly = await this.create({
      ...assemblyData,
      name: newName
    });

    // Copy line items
    if (line_items && line_items.length > 0) {
      for (const lineItem of line_items) {
        await this.addLineItem({
          assembly_id: newAssembly.id,
          line_item_id: lineItem.line_item_id,
          quantity: lineItem.quantity,
          unit: lineItem.unit,
          price_override: lineItem.price_override,
          display_order: lineItem.display_order,
          is_optional: lineItem.is_optional
        });
      }
    }

    return await this.getById(newAssembly.id) || newAssembly;
  }
}