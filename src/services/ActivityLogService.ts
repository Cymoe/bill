import { supabase } from '../lib/supabase';

export type EntityType = 
  | 'invoice' 
  | 'estimate' 
  | 'client' 
  | 'project' 
  | 'product' 
  | 'payment' 
  | 'expense' 
  | 'team_member' 
  | 'subcontractor' 
  | 'vendor' 
  | 'work_pack' 
  | 'template';

export type ActionType = 
  | 'created' 
  | 'updated' 
  | 'deleted' 
  | 'sent' 
  | 'opened' 
  | 'paid' 
  | 'accepted' 
  | 'rejected' 
  | 'converted' 
  | 'archived'
  | 'restored' 
  | 'signed' 
  | 'exported' 
  | 'imported' 
  | 'assigned'
  | 'unassigned' 
  | 'status_changed' 
  | 'milestone_completed';

export interface ActivityLog {
  id?: string;
  organization_id: string;
  user_id: string;
  entity_type: EntityType;
  entity_id: string;
  action: ActionType;
  description: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
  // View fields
  user_email?: string;
  user_name?: string;
  user_avatar?: string;
}

export interface ActivityLogFilters {
  organizationId: string;
  userId?: string;
  entityType?: EntityType;
  entityId?: string;
  action?: ActionType;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export class ActivityLogService {
  /**
   * Log a user action
   */
  static async log(params: {
    organizationId: string;
    entityType: EntityType;
    entityId: string;
    action: ActionType;
    description: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user for activity log');
        return;
      }

      // Get user's IP and user agent if available (would need to be passed from frontend)
      const ipAddress = (params.metadata?.ipAddress as string) || null;
      const userAgent = (params.metadata?.userAgent as string) || null;

      // Remove IP and user agent from metadata to avoid duplication
      const cleanMetadata = { ...params.metadata };
      delete cleanMetadata?.ipAddress;
      delete cleanMetadata?.userAgent;

      const { error } = await supabase
        .from('activity_logs')
        .insert({
          organization_id: params.organizationId,
          user_id: user.id,
          entity_type: params.entityType,
          entity_id: params.entityId,
          action: params.action,
          description: params.description,
          metadata: cleanMetadata || {},
          ip_address: ipAddress,
          user_agent: userAgent
        });

      if (error) {
        console.error('Failed to log activity:', error);
      }
    } catch (error) {
      console.error('Error in activity logging:', error);
    }
  }

  /**
   * Get activity logs with filters
   */
  static async list(filters: ActivityLogFilters): Promise<ActivityLog[]> {
    let query = supabase
      .from('activity_logs_with_users')
      .select('*')
      .eq('organization_id', filters.organizationId)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters.entityType) {
      query = query.eq('entity_type', filters.entityType);
    }
    if (filters.entityId) {
      query = query.eq('entity_id', filters.entityId);
    }
    if (filters.action) {
      query = query.eq('action', filters.action);
    }
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    // Apply pagination
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data || [];
  }

  /**
   * Get recent activity for dashboard widget
   */
  static async getRecent(organizationId: string, limit: number = 10): Promise<ActivityLog[]> {
    return this.list({ organizationId, limit });
  }

  /**
   * Get activity for a specific entity
   */
  static async getForEntity(
    organizationId: string, 
    entityType: EntityType, 
    entityId: string
  ): Promise<ActivityLog[]> {
    return this.list({ organizationId, entityType, entityId });
  }

  /**
   * Subscribe to real-time activity updates
   */
  static subscribeToActivity(
    organizationId: string,
    callback: (activity: ActivityLog) => void
  ) {
    const channel = supabase
      .channel(`activity_logs:${organizationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs',
          filter: `organization_id=eq.${organizationId}`
        },
        async (payload) => {
          // Fetch the full record with user details
          const { data } = await supabase
            .from('activity_logs_with_users')
            .select('*')
            .eq('id', payload.new.id)
            .single();
          
          if (data) {
            callback(data);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  /**
   * Helper to build consistent descriptions
   */
  static buildDescription(
    action: ActionType,
    entityType: EntityType,
    entityName: string,
    additionalInfo?: string
  ): string {
    const actionVerbs: Record<ActionType, string> = {
      created: 'created',
      updated: 'updated',
      deleted: 'deleted',
      sent: 'sent',
      opened: 'opened',
      paid: 'marked as paid',
      accepted: 'accepted',
      rejected: 'rejected',
      converted: 'converted',
      archived: 'archived',
      restored: 'restored',
      signed: 'signed',
      exported: 'exported',
      imported: 'imported',
      assigned: 'assigned',
      unassigned: 'unassigned',
      status_changed: 'changed status of',
      milestone_completed: 'completed milestone for'
    };

    const verb = actionVerbs[action] || action;
    let description = `${verb} ${entityType} "${entityName}"`;
    
    if (additionalInfo) {
      description += ` ${additionalInfo}`;
    }
    
    return description;
  }

  /**
   * Export activity logs
   */
  static async export(filters: ActivityLogFilters): Promise<Blob> {
    // Get all matching logs (override limit)
    const logs = await this.list({ ...filters, limit: 10000, offset: 0 });
    
    // Convert to CSV
    const headers = [
      'Date/Time',
      'User',
      'Action',
      'Entity Type',
      'Description',
      'IP Address'
    ];
    
    const rows = logs.map(log => [
      new Date(log.created_at!).toLocaleString(),
      log.user_email || 'Unknown',
      log.action,
      log.entity_type,
      log.description,
      log.ip_address || ''
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    return new Blob([csv], { type: 'text/csv' });
  }
}