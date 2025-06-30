import { supabase } from '../lib/supabase';
import { ActivityLogService } from './ActivityLogService';

export interface Project {
  id?: string;
  user_id?: string;
  organization_id?: string;
  name: string;
  description?: string;
  client_id?: string;
  status: 'planned' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  start_date?: string;
  end_date?: string;
  budget?: number;
  actual_cost?: number;
  location?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  pricing_mode_id?: string;
  lock_pricing?: boolean;
  pricing_mode?: {
    id: string;
    name: string;
    icon: string;
    description?: string;
  };
  client?: {
    id: string;
    name: string;
    company_name?: string;
  };
}

export class ProjectService {
  static async list(organizationId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        client:clients(id, name, company_name),
        pricing_mode:pricing_modes(id, name, icon, description)
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        client:clients(id, name, company_name),
        pricing_mode:pricing_modes(id, name, icon, description)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async create(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();

    if (error) throw error;

    // Get full project with client info
    const fullProject = await this.getById(data.id);

    // Log activity
    try {
      await ActivityLogService.log({
        organizationId: project.organization_id!,
        entityType: 'project',
        entityId: data.id,
        action: 'created',
        description: `created project ${data.name}`,
        metadata: {
          project_name: data.name,
          client_id: data.client_id,
          client_name: fullProject?.client?.name,
          status: data.status,
          budget: data.budget
        }
      });
    } catch (logError) {
      console.error('Failed to log project creation:', logError);
    }

    return fullProject!;
  }

  static async update(id: string, updates: Partial<Project>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const fullProject = await this.getById(id);

    // Log activity
    try {
      await ActivityLogService.log({
        organizationId: data.organization_id,
        entityType: 'project',
        entityId: id,
        action: 'updated',
        description: `updated project ${data.name}`,
        metadata: {
          project_name: data.name,
          updated_fields: Object.keys(updates),
          status: data.status
        }
      });
    } catch (logError) {
      console.error('Failed to log project update:', logError);
    }

    return fullProject!;
  }

  static async updateStatus(id: string, status: Project['status']): Promise<Project> {
    const project = await this.getById(id);
    if (!project) throw new Error('Project not found');

    const { data, error } = await supabase
      .from('projects')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    try {
      await ActivityLogService.log({
        organizationId: data.organization_id,
        entityType: 'project',
        entityId: id,
        action: 'status_changed',
        description: `changed status of project ${data.name} to ${status}`,
        metadata: {
          project_name: data.name,
          old_status: project.status,
          new_status: status
        }
      });
    } catch (logError) {
      console.error('Failed to log project status change:', logError);
    }

    return await this.getById(id) || data;
  }

  static async delete(id: string): Promise<void> {
    // Get project info before deletion for logging
    const project = await this.getById(id);
    
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Log activity
    if (project) {
      try {
        await ActivityLogService.log({
          organizationId: project.organization_id!,
          entityType: 'project',
          entityId: id,
          action: 'deleted',
          description: `deleted project ${project.name}`,
          metadata: {
            project_name: project.name,
            client_name: project.client?.name,
            status: project.status
          }
        });
      } catch (logError) {
        console.error('Failed to log project deletion:', logError);
      }
    }
  }
}