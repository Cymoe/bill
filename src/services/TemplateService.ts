import { supabase } from '../lib/supabase';
import { ActivityLogService } from './ActivityLogService';

export interface TemplateItem {
  id?: string;
  template_id?: string;
  name: string;
  description?: string;
  quantity: number;
  unit?: string;
  price_per_unit: number;
  display_order?: number;
}

export interface Template {
  id?: string;
  user_id?: string;
  organization_id?: string;
  name: string;
  category: string;
  description: string;
  is_custom: boolean;
  is_favorite?: boolean;
  usage_count?: number;
  created_at?: string;
  updated_at?: string;
  items?: TemplateItem[];
}

export class TemplateService {
  static async list(organizationId: string): Promise<Template[]> {
    const { data, error } = await supabase
      .from('templates')
      .select(`
        *,
        items:template_items(*)
      `)
      .eq('organization_id', organizationId)
      .order('category')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<Template | null> {
    const { data, error } = await supabase
      .from('templates')
      .select(`
        *,
        items:template_items(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async create(template: Omit<Template, 'id' | 'created_at' | 'updated_at'> & {
    items?: TemplateItem[];
  }): Promise<Template> {
    const { items, ...templateData } = template;

    // Create the template
    const { data: newTemplate, error } = await supabase
      .from('templates')
      .insert({
        ...templateData,
        is_custom: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Create template items if provided
    if (items && items.length > 0) {
      const itemsData = items.map((item, index) => ({
        ...item,
        template_id: newTemplate.id,
        display_order: item.display_order ?? index
      }));

      const { error: itemsError } = await supabase
        .from('template_items')
        .insert(itemsData);

      if (itemsError) throw itemsError;
    }

    // Log activity
    try {
      await ActivityLogService.log({
        organizationId: template.organization_id!,
        entityType: 'template',
        entityId: newTemplate.id,
        action: 'created',
        description: `created template ${newTemplate.name}`,
        metadata: {
          name: newTemplate.name,
          category: newTemplate.category,
          is_custom: true,
          item_count: items?.length || 0
        }
      });
    } catch (logError) {
      console.error('Failed to log template creation:', logError);
    }

    return this.getById(newTemplate.id) as Promise<Template>;
  }

  static async update(id: string, updates: Partial<Template> & {
    items?: TemplateItem[];
  }): Promise<Template> {
    const { items, ...templateData } = updates;

    // Get current template for comparison
    const { data: currentTemplate, error: fetchError } = await supabase
      .from('templates')
      .select('name, category')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Update the template
    const { data: updatedTemplate, error } = await supabase
      .from('templates')
      .update({
        ...templateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Update items if provided
    if (items !== undefined) {
      // Delete existing items
      const { error: deleteError } = await supabase
        .from('template_items')
        .delete()
        .eq('template_id', id);

      if (deleteError) throw deleteError;

      // Insert new items
      if (items.length > 0) {
        const itemsData = items.map((item, index) => ({
          ...item,
          template_id: id,
          display_order: item.display_order ?? index
        }));

        const { error: itemsError } = await supabase
          .from('template_items')
          .insert(itemsData);

        if (itemsError) throw itemsError;
      }
    }

    // Log activity
    try {
      await ActivityLogService.log({
        organizationId: updatedTemplate.organization_id,
        entityType: 'template',
        entityId: id,
        action: 'updated',
        description: `updated template ${updatedTemplate.name}`,
        metadata: {
          name: updatedTemplate.name,
          old_name: currentTemplate.name !== updatedTemplate.name ? currentTemplate.name : undefined,
          updated_fields: Object.keys(templateData),
          item_count: items?.length
        }
      });
    } catch (logError) {
      console.error('Failed to log template update:', logError);
    }

    return this.getById(id) as Promise<Template>;
  }

  static async duplicate(id: string, organizationId: string): Promise<Template> {
    const original = await this.getById(id);
    if (!original) throw new Error('Template not found');

    const duplicated = await this.create({
      ...original,
      name: `${original.name} (Copy)`,
      organization_id: organizationId,
      is_custom: true,
      is_favorite: false,
      items: original.items
    });

    // Log activity
    try {
      await ActivityLogService.log({
        organizationId,
        entityType: 'template',
        entityId: duplicated.id!,
        action: 'created',
        description: `duplicated template ${original.name}`,
        metadata: {
          original_id: original.id,
          original_name: original.name,
          new_name: duplicated.name
        }
      });
    } catch (logError) {
      console.error('Failed to log template duplication:', logError);
    }

    return duplicated;
  }

  static async toggleFavorite(id: string, organizationId: string): Promise<Template> {
    const { data: template, error: fetchError } = await supabase
      .from('templates')
      .select('name, is_favorite')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const newFavoriteStatus = !template.is_favorite;

    const { data: updated, error } = await supabase
      .from('templates')
      .update({ is_favorite: newFavoriteStatus })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    try {
      await ActivityLogService.log({
        organizationId,
        entityType: 'template',
        entityId: id,
        action: 'updated',
        description: `${newFavoriteStatus ? 'favorited' : 'unfavorited'} template ${template.name}`,
        metadata: {
          name: template.name,
          is_favorite: newFavoriteStatus
        }
      });
    } catch (logError) {
      console.error('Failed to log template favorite toggle:', logError);
    }

    return updated;
  }

  static async delete(id: string, organizationId: string): Promise<void> {
    const { data: template, error: fetchError } = await supabase
      .from('templates')
      .select('name, category')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Delete template items first
    const { error: itemsError } = await supabase
      .from('template_items')
      .delete()
      .eq('template_id', id);

    if (itemsError) throw itemsError;

    // Delete the template
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Log activity
    try {
      await ActivityLogService.log({
        organizationId,
        entityType: 'template',
        entityId: id,
        action: 'deleted',
        description: `deleted template ${template.name}`,
        metadata: {
          name: template.name,
          category: template.category
        }
      });
    } catch (logError) {
      console.error('Failed to log template deletion:', logError);
    }
  }

  static async incrementUsageCount(id: string): Promise<void> {
    const { data: template, error: fetchError } = await supabase
      .from('templates')
      .select('usage_count')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const { error } = await supabase
      .from('templates')
      .update({ usage_count: (template.usage_count || 0) + 1 })
      .eq('id', id);

    if (error) throw error;
  }
}