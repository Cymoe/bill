import { supabase } from '../lib/supabase';
import { ActivityLogService } from './ActivityLogService';

export interface Client {
  id?: string;
  user_id?: string;
  organization_id?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  company_name?: string;
  website?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export class ClientService {
  static async list(organizationId: string): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async create(client: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .insert(client)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    try {
      await ActivityLogService.log({
        organizationId: client.organization_id!,
        entityType: 'client',
        entityId: data.id,
        action: 'created',
        description: `created client ${data.name}`,
        metadata: {
          client_name: data.name,
          client_email: data.email,
          company_name: data.company_name
        }
      });
    } catch (logError) {
      console.error('Failed to log client creation:', logError);
    }

    return data;
  }

  static async update(id: string, updates: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    try {
      await ActivityLogService.log({
        organizationId: data.organization_id,
        entityType: 'client',
        entityId: id,
        action: 'updated',
        description: `updated client ${data.name}`,
        metadata: {
          client_name: data.name,
          updated_fields: Object.keys(updates)
        }
      });
    } catch (logError) {
      console.error('Failed to log client update:', logError);
    }

    return data;
  }

  static async delete(id: string): Promise<void> {
    // Get client info before deletion for logging
    const client = await this.getById(id);
    
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Log activity
    if (client) {
      try {
        await ActivityLogService.log({
          organizationId: client.organization_id!,
          entityType: 'client',
          entityId: id,
          action: 'deleted',
          description: `deleted client ${client.name}`,
          metadata: {
            client_name: client.name,
            client_email: client.email
          }
        });
      } catch (logError) {
        console.error('Failed to log client deletion:', logError);
      }
    }
  }
}