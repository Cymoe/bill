import { supabase } from '../lib/supabase';
import { ActivityLogService } from './ActivityLogService';

export interface WorkPack {
  id: string;
  name: string;
  description?: string;
  tier: 'basic' | 'standard' | 'premium';
  base_price: number;
  industry_id?: string;
  industry_name?: string;
  organization_id?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  // Computed fields from view
  item_count?: number;
  product_count?: number;
  task_count?: number;
  document_count?: number;
  calculated_price?: number;
}

export interface WorkPackItem {
  id: string;
  work_pack_id: string;
  product_id?: string;
  line_item_id?: string;
  assembly_id?: string;
  item_type: 'product' | 'line_item' | 'assembly';
  quantity: number;
  unit?: string;
  price?: number;
  is_optional: boolean;
  display_order: number;
  created_at: string;
  // Related data
  product?: any;
  line_item?: any;
}

export interface WorkPackTask {
  id: string;
  work_pack_id: string;
  name: string;
  description?: string;
  duration_days?: number;
  display_order: number;
  is_milestone: boolean;
  created_at: string;
}

export class WorkPackService {
  /**
   * List all work packs for an organization
   */
  static async list(organizationId: string): Promise<WorkPack[]> {
    console.log('WorkPackService.list called with org:', organizationId);
    
    const { data, error } = await supabase
      .rpc('get_organization_work_packs', { 
        p_organization_id: organizationId 
      });

    if (error) {
      console.error('Error fetching work packs:', error);
      throw error;
    }
    
    console.log('WorkPackService returned:', data?.length || 0, 'work packs');
    
    return data || [];
  }

  /**
   * Get a single work pack by ID with all related data
   */
  static async getById(id: string): Promise<WorkPack & { items: WorkPackItem[], tasks: WorkPackTask[] }> {
    // Get work pack details
    const { data: workPack, error: packError } = await supabase
      .from('work_packs')
      .select(`
        *,
        industry:industries(id, name)
      `)
      .eq('id', id)
      .single();

    if (packError) {
      throw packError;
    }

    // Get work pack items separately to avoid ambiguity
    const { data: items, error: itemsError } = await supabase
      .from('work_pack_items')
      .select('*')
      .eq('work_pack_id', id)
      .order('display_order');

    if (itemsError) {
      throw itemsError;
    }

    // If items have product_ids, fetch product details separately
    if (items && items.length > 0) {
      const productIds = items.filter(item => item.product_id).map(item => item.product_id);
      if (productIds.length > 0) {
        const { data: products } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds);
        
        // Attach products to items
        if (products) {
          items.forEach(item => {
            if (item.product_id) {
              item.product = products.find(p => p.id === item.product_id);
            }
          });
        }
      }
    }

    // Get work pack tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('work_pack_tasks')
      .select('*')
      .eq('work_pack_id', id)
      .order('display_order');

    if (tasksError) {
      throw tasksError;
    }

    return {
      ...workPack,
      industry_name: workPack.industry?.name,
      items: items || [],
      tasks: tasks || []
    };
  }

  /**
   * Create a new work pack
   */
  static async create(workPack: Omit<WorkPack, 'id' | 'created_at' | 'updated_at'> & {
    organization_id: string;
    items?: Array<{
      product_id?: string;
      line_item_id?: string;
      assembly_id?: string;
      item_type: 'product' | 'line_item' | 'assembly';
      quantity: number;
      unit?: string;
      price?: number;
      is_optional?: boolean;
      display_order?: number;
    }>;
    tasks?: Array<{
      name: string;
      description?: string;
      duration_days?: number;
      is_milestone?: boolean;
      display_order?: number;
    }>;
  }): Promise<WorkPack> {
    const { items, tasks, ...workPackData } = workPack;

    // Create the work pack
    const { data: newWorkPack, error: packError } = await supabase
      .from('work_packs')
      .insert({
        ...workPackData,
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (packError) {
      throw packError;
    }

    // Create work pack items if provided
    if (items && items.length > 0) {
      const workPackItems = items.map((item, index) => ({
        ...item,
        work_pack_id: newWorkPack.id,
        display_order: item.display_order ?? index
      }));

      const { error: itemsError } = await supabase
        .from('work_pack_items')
        .insert(workPackItems);

      if (itemsError) {
        throw itemsError;
      }
    }

    // Create work pack tasks if provided
    if (tasks && tasks.length > 0) {
      const workPackTasks = tasks.map((task, index) => ({
        ...task,
        work_pack_id: newWorkPack.id,
        display_order: task.display_order ?? index
      }));

      const { error: tasksError } = await supabase
        .from('work_pack_tasks')
        .insert(workPackTasks);

      if (tasksError) {
        throw tasksError;
      }
    }

    // Log activity
    await ActivityLogService.log({
      organizationId: workPack.organization_id,
      entityType: 'work_pack',
      entityId: newWorkPack.id,
      action: 'created',
      description: `created work pack ${newWorkPack.name}`,
      metadata: {
        tier: newWorkPack.tier,
        base_price: newWorkPack.base_price,
        item_count: items?.length || 0,
        task_count: tasks?.length || 0
      }
    });

    return newWorkPack;
  }

  /**
   * Update an existing work pack
   */
  static async update(id: string, updates: Partial<WorkPack> & { organization_id: string }): Promise<WorkPack> {
    // Get the current work pack for comparison
    const { data: currentWorkPack, error: fetchError } = await supabase
      .from('work_packs')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Update the work pack
    const { data: updatedWorkPack, error: updateError } = await supabase
      .from('work_packs')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Build metadata for what changed
    const metadata: Record<string, any> = {};
    if (updates.name && updates.name !== currentWorkPack.name) {
      metadata.old_name = currentWorkPack.name;
      metadata.new_name = updates.name;
    }
    if (updates.base_price !== undefined && updates.base_price !== currentWorkPack.base_price) {
      metadata.old_price = currentWorkPack.base_price;
      metadata.new_price = updates.base_price;
    }
    if (updates.tier && updates.tier !== currentWorkPack.tier) {
      metadata.old_tier = currentWorkPack.tier;
      metadata.new_tier = updates.tier;
    }

    // Log activity
    await ActivityLogService.log({
      organizationId: updates.organization_id,
      entityType: 'work_pack',
      entityId: id,
      action: 'updated',
      description: `updated work pack ${updatedWorkPack.name}`,
      metadata
    });

    return updatedWorkPack;
  }

  /**
   * Delete a work pack
   */
  static async delete(id: string, organizationId: string): Promise<void> {
    // Get work pack info before deletion
    const { data: workPack, error: fetchError } = await supabase
      .from('work_packs')
      .select('name, base_price, tier')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Delete the work pack (cascades to items, tasks, etc.)
    const { error: deleteError } = await supabase
      .from('work_packs')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw deleteError;
    }

    // Log activity
    await ActivityLogService.log({
      organizationId,
      entityType: 'work_pack',
      entityId: id,
      action: 'deleted',
      description: `deleted work pack ${workPack.name}`,
      metadata: {
        name: workPack.name,
        base_price: workPack.base_price,
        tier: workPack.tier
      }
    });
  }

  /**
   * Add a product to a work pack
   */
  static async addProduct(workPackId: string, productId: string, quantity: number = 1, organizationId: string): Promise<void> {
    // Get the next display order
    const { data: existingItems } = await supabase
      .from('work_pack_items')
      .select('display_order')
      .eq('work_pack_id', workPackId)
      .order('display_order', { ascending: false })
      .limit(1);

    const nextOrder = existingItems && existingItems.length > 0 
      ? (existingItems[0].display_order + 1) 
      : 0;

    // Add the product
    const { error } = await supabase
      .from('work_pack_items')
      .insert({
        work_pack_id: workPackId,
        product_id: productId,
        item_type: 'product',
        quantity,
        display_order: nextOrder
      });

    if (error) {
      throw error;
    }

    // Get product and work pack names for logging
    const { data: product } = await supabase
      .from('products')
      .select('name')
      .eq('id', productId)
      .single();

    const { data: workPack } = await supabase
      .from('work_packs')
      .select('name')
      .eq('id', workPackId)
      .single();

    // Log activity
    await ActivityLogService.log({
      organizationId,
      entityType: 'work_pack',
      entityId: workPackId,
      action: 'updated',
      description: `added product "${product?.name}" to work pack "${workPack?.name}"`,
      metadata: {
        product_id: productId,
        product_name: product?.name,
        quantity
      }
    });
  }

  /**
   * Remove a product from a work pack
   */
  static async removeProduct(workPackId: string, itemId: string, organizationId: string): Promise<void> {
    // Get item details before deletion
    const { data: item } = await supabase
      .from('work_pack_items')
      .select('*, product_id')
      .eq('id', itemId)
      .single();

    // Get product name if it exists
    let productName = null;
    if (item?.product_id) {
      const { data: product } = await supabase
        .from('products')
        .select('name')
        .eq('id', item.product_id)
        .single();
      productName = product?.name;
    }

    // Delete the item
    const { error } = await supabase
      .from('work_pack_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      throw error;
    }

    // Get work pack name for logging
    const { data: workPack } = await supabase
      .from('work_packs')
      .select('name')
      .eq('id', workPackId)
      .single();

    // Log activity
    await ActivityLogService.log({
      organizationId,
      entityType: 'work_pack',
      entityId: workPackId,
      action: 'updated',
      description: `removed product "${productName}" from work pack "${workPack?.name}"`,
      metadata: {
        product_id: item?.product_id,
        product_name: productName,
        quantity: item?.quantity
      }
    });
  }

  /**
   * Duplicate a work pack
   */
  static async duplicate(id: string, organizationId: string): Promise<WorkPack> {
    // Get the original work pack with all related data
    const original = await this.getById(id);

    // Create the duplicate
    const duplicate = await this.create({
      ...original,
      name: `${original.name} (Copy)`,
      organization_id: organizationId,
      items: original.items.map(item => ({
        product_id: item.product_id,
        line_item_id: item.line_item_id,
        item_type: item.item_type,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price,
        is_optional: item.is_optional,
        display_order: item.display_order
      })),
      tasks: original.tasks.map(task => ({
        name: task.name,
        description: task.description,
        duration_days: task.duration_days,
        is_milestone: task.is_milestone,
        display_order: task.display_order
      }))
    });

    return duplicate;
  }

  /**
   * Generate tier variants for a work pack
   */
  static async generateVariants(
    id: string, 
    organizationId: string,
    basicMultiplier: number = 0.85,
    premiumMultiplier: number = 1.25
  ): Promise<{ basic: WorkPack, premium: WorkPack }> {
    // Get the original work pack
    const original = await this.getById(id);

    if (original.tier !== 'standard') {
      throw new Error('Can only generate variants from standard tier work packs');
    }

    // Create basic variant
    const basic = await this.create({
      ...original,
      name: `${original.name} - Basic`,
      tier: 'basic',
      base_price: original.base_price * basicMultiplier,
      organization_id: organizationId,
      items: original.items.map(item => ({
        ...item,
        price: item.price ? item.price * basicMultiplier : undefined
      })),
      tasks: original.tasks
    });

    // Create premium variant
    const premium = await this.create({
      ...original,
      name: `${original.name} - Premium`,
      tier: 'premium',
      base_price: original.base_price * premiumMultiplier,
      organization_id: organizationId,
      items: original.items.map(item => ({
        ...item,
        price: item.price ? item.price * premiumMultiplier : undefined
      })),
      tasks: original.tasks
    });

    // Log activity
    await ActivityLogService.log({
      organizationId,
      entityType: 'work_pack',
      entityId: id,
      action: 'created',
      description: `generated tier variants for work pack "${original.name}"`,
      metadata: {
        basic_id: basic.id,
        premium_id: premium.id,
        basic_multiplier: basicMultiplier,
        premium_multiplier: premiumMultiplier
      }
    });

    return { basic, premium };
  }
}