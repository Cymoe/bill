import { supabase } from '../lib/supabase';
import { ActivityLogService } from './ActivityLogService';

export interface WorkPackTask {
  id?: string;
  work_pack_id?: string;
  title: string;
  description: string;
  estimated_hours: number;
  display_order: number;
}

export interface WorkPackExpense {
  id?: string;
  work_pack_id?: string;
  description: string;
  amount: number;
  category: string;
  vendor?: string;
  display_order: number;
}

export interface WorkPackItem {
  id?: string;
  work_pack_id?: string;
  item_type: 'product' | 'line_item';
  line_item_id?: string;
  product_id?: string;
  quantity: number;
  price: number;
  display_order: number;
  line_item?: {
    id: string;
    name: string;
    description?: string;
    unit?: string;
    price: number;
  };
  product?: {
    id: string;
    name: string;
    description?: string;
    price: number;
    unit: string;
  };
}

export interface WorkPack {
  id?: string;
  user_id?: string;
  organization_id?: string;
  name: string;
  description: string;
  industry_id: string;
  project_type_id: string;
  tier: 'budget' | 'standard' | 'premium';
  base_price: number;
  is_active: boolean;
  usage_count?: number;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
  industry?: {
    id: string;
    name: string;
    slug: string;
    icon?: string;
  };
  project_type?: {
    id: string;
    name: string;
    slug: string;
  };
  tasks?: WorkPackTask[];
  expenses?: WorkPackExpense[];
  items?: WorkPackItem[];
}

export class WorkPackService {
  static async list(organizationId: string): Promise<WorkPack[]> {
    const { data, error } = await supabase
      .from('work_packs')
      .select(`
        *,
        industry:industries(id, name, slug, icon),
        project_type:project_categories!project_type_id(id, name, slug)
      `)
      .eq('organization_id', organizationId)
      .order('industry_id')
      .order('base_price');

    if (error) throw error;

    // Enrich with related data
    const enrichedWorkPacks = await Promise.all(
      (data || []).map(async (pack) => {
        const [tasks, expenses, items] = await Promise.all([
          this.getTasksForWorkPack(pack.id),
          this.getExpensesForWorkPack(pack.id),
          this.getItemsForWorkPack(pack.id)
        ]);

        return {
          ...pack,
          tasks,
          expenses,
          items
        };
      })
    );

    return enrichedWorkPacks;
  }

  static async getById(id: string): Promise<WorkPack | null> {
    const { data, error } = await supabase
      .from('work_packs')
      .select(`
        *,
        industry:industries(id, name, slug, icon),
        project_type:project_categories!project_type_id(id, name, slug)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    // Load related data
    const [tasks, expenses, items] = await Promise.all([
      this.getTasksForWorkPack(id),
      this.getExpensesForWorkPack(id),
      this.getItemsForWorkPack(id)
    ]);

    return {
      ...data,
      tasks,
      expenses,
      items
    };
  }

  static async create(workPack: Omit<WorkPack, 'id' | 'created_at' | 'updated_at'> & {
    tasks?: WorkPackTask[];
    expenses?: WorkPackExpense[];
    items?: WorkPackItem[];
  }): Promise<WorkPack> {
    const { tasks, expenses, items, ...workPackData } = workPack;

    // Create the work pack
    const { data: newWorkPack, error } = await supabase
      .from('work_packs')
      .insert({
        ...workPackData,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Create related data
    if (tasks && tasks.length > 0) {
      await this.createTasksForWorkPack(newWorkPack.id, tasks);
    }

    if (expenses && expenses.length > 0) {
      await this.createExpensesForWorkPack(newWorkPack.id, expenses);
    }

    if (items && items.length > 0) {
      await this.createItemsForWorkPack(newWorkPack.id, items);
    }

    // Log activity
    try {
      await ActivityLogService.log({
        organizationId: workPack.organization_id!,
        entityType: 'work_pack',
        entityId: newWorkPack.id,
        action: 'created',
        description: `created work pack ${newWorkPack.name}`,
        metadata: {
          name: newWorkPack.name,
          tier: newWorkPack.tier,
          base_price: newWorkPack.base_price,
          industry_id: newWorkPack.industry_id,
          task_count: tasks?.length || 0,
          expense_count: expenses?.length || 0,
          item_count: items?.length || 0
        }
      });
    } catch (logError) {
      console.error('Failed to log work pack creation:', logError);
    }

    return this.getById(newWorkPack.id) as Promise<WorkPack>;
  }

  static async update(id: string, updates: Partial<WorkPack> & {
    tasks?: WorkPackTask[];
    expenses?: WorkPackExpense[];
    items?: WorkPackItem[];
  }): Promise<WorkPack> {
    const { tasks, expenses, items, ...workPackData } = updates;

    // Update the work pack
    const { data: updatedWorkPack, error } = await supabase
      .from('work_packs')
      .update({
        ...workPackData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Update related data if provided
    if (tasks !== undefined) {
      await supabase.from('work_pack_tasks').delete().eq('work_pack_id', id);
      if (tasks.length > 0) {
        await this.createTasksForWorkPack(id, tasks);
      }
    }

    if (expenses !== undefined) {
      await supabase.from('work_pack_expenses').delete().eq('work_pack_id', id);
      if (expenses.length > 0) {
        await this.createExpensesForWorkPack(id, expenses);
      }
    }

    if (items !== undefined) {
      await supabase.from('work_pack_items').delete().eq('work_pack_id', id);
      if (items.length > 0) {
        await this.createItemsForWorkPack(id, items);
      }
    }

    // Log activity
    try {
      await ActivityLogService.log({
        organizationId: updatedWorkPack.organization_id,
        entityType: 'work_pack',
        entityId: id,
        action: 'updated',
        description: `updated work pack ${updatedWorkPack.name}`,
        metadata: {
          name: updatedWorkPack.name,
          updated_fields: Object.keys(workPackData),
          task_count: tasks?.length,
          expense_count: expenses?.length,
          item_count: items?.length
        }
      });
    } catch (logError) {
      console.error('Failed to log work pack update:', logError);
    }

    return this.getById(id) as Promise<WorkPack>;
  }

  static async duplicate(id: string, organizationId: string): Promise<WorkPack> {
    const original = await this.getById(id);
    if (!original) throw new Error('Work pack not found');

    const duplicated = await this.create({
      ...original,
      name: `${original.name} (Copy)`,
      organization_id: organizationId,
      is_active: true,
      tasks: original.tasks,
      expenses: original.expenses,
      items: original.items
    });

    // Log activity
    try {
      await ActivityLogService.log({
        organizationId,
        entityType: 'work_pack',
        entityId: duplicated.id!,
        action: 'created',
        description: `duplicated work pack ${original.name}`,
        metadata: {
          original_id: original.id,
          original_name: original.name,
          new_name: duplicated.name
        }
      });
    } catch (logError) {
      console.error('Failed to log work pack duplication:', logError);
    }

    return duplicated;
  }

  static async archive(id: string, organizationId: string): Promise<WorkPack> {
    const { data: workPack, error: fetchError } = await supabase
      .from('work_packs')
      .select('name, is_active')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const newStatus = !workPack.is_active;

    const { data: updated, error } = await supabase
      .from('work_packs')
      .update({ is_active: newStatus })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    try {
      await ActivityLogService.log({
        organizationId,
        entityType: 'work_pack',
        entityId: id,
        action: newStatus ? 'restored' : 'archived',
        description: `${newStatus ? 'restored' : 'archived'} work pack ${workPack.name}`,
        metadata: {
          name: workPack.name,
          is_active: newStatus
        }
      });
    } catch (logError) {
      console.error('Failed to log work pack archive/restore:', logError);
    }

    return updated;
  }

  static async delete(id: string, organizationId: string): Promise<void> {
    const { data: workPack, error: fetchError } = await supabase
      .from('work_packs')
      .select('name, tier, base_price')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Delete related data first
    await Promise.all([
      supabase.from('work_pack_items').delete().eq('work_pack_id', id),
      supabase.from('work_pack_tasks').delete().eq('work_pack_id', id),
      supabase.from('work_pack_expenses').delete().eq('work_pack_id', id),
      supabase.from('work_pack_document_templates').delete().eq('work_pack_id', id)
    ]);

    // Delete the work pack
    const { error } = await supabase
      .from('work_packs')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Log activity
    try {
      await ActivityLogService.log({
        organizationId,
        entityType: 'work_pack',
        entityId: id,
        action: 'deleted',
        description: `deleted work pack ${workPack.name}`,
        metadata: {
          name: workPack.name,
          tier: workPack.tier,
          base_price: workPack.base_price
        }
      });
    } catch (logError) {
      console.error('Failed to log work pack deletion:', logError);
    }
  }

  // Helper methods
  private static async getTasksForWorkPack(workPackId: string): Promise<WorkPackTask[]> {
    const { data, error } = await supabase
      .from('work_pack_tasks')
      .select('*')
      .eq('work_pack_id', workPackId)
      .order('display_order');

    if (error) throw error;
    return data || [];
  }

  private static async getExpensesForWorkPack(workPackId: string): Promise<WorkPackExpense[]> {
    const { data, error } = await supabase
      .from('work_pack_expenses')
      .select('*')
      .eq('work_pack_id', workPackId)
      .order('display_order');

    if (error) throw error;
    return data || [];
  }

  private static async getItemsForWorkPack(workPackId: string): Promise<WorkPackItem[]> {
    const { data, error } = await supabase
      .from('work_pack_items')
      .select(`
        *,
        line_item:line_items(*),
        product:products(*)
      `)
      .eq('work_pack_id', workPackId)
      .order('display_order');

    if (error) throw error;
    return data || [];
  }

  private static async createTasksForWorkPack(workPackId: string, tasks: WorkPackTask[]): Promise<void> {
    const tasksData = tasks.map((task, index) => ({
      ...task,
      work_pack_id: workPackId,
      display_order: task.display_order ?? index
    }));

    const { error } = await supabase
      .from('work_pack_tasks')
      .insert(tasksData);

    if (error) throw error;
  }

  private static async createExpensesForWorkPack(workPackId: string, expenses: WorkPackExpense[]): Promise<void> {
    const expensesData = expenses.map((expense, index) => ({
      ...expense,
      work_pack_id: workPackId,
      display_order: expense.display_order ?? index
    }));

    const { error } = await supabase
      .from('work_pack_expenses')
      .insert(expensesData);

    if (error) throw error;
  }

  private static async createItemsForWorkPack(workPackId: string, items: WorkPackItem[]): Promise<void> {
    const itemsData = items.map((item, index) => ({
      work_pack_id: workPackId,
      item_type: item.item_type,
      line_item_id: item.line_item_id || null,
      product_id: item.product_id || null,
      quantity: item.quantity,
      price: item.price,
      display_order: item.display_order ?? index
    }));

    const { error } = await supabase
      .from('work_pack_items')
      .insert(itemsData);

    if (error) throw error;
  }
}