import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface ActivityLog {
  id: string;
  organization_id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_name: string | null;
  metadata: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user?: {
    email: string;
    user_metadata: {
      full_name?: string;
    };
  };
}

export type ActivityAction = 
  | 'created'
  | 'updated'
  | 'deleted'
  | 'sent'
  | 'paid'
  | 'overdue'
  | 'converted'
  | 'signed'
  | 'viewed'
  | 'downloaded'
  | 'shared'
  | 'archived'
  | 'restored'
  | 'invited'
  | 'removed'
  | 'completed'
  | 'cancelled'
  | 'approved'
  | 'rejected'
  | 'status_changed'
  | 'payment_received';

export type EntityType = 
  | 'invoice'
  | 'estimate'
  | 'client'
  | 'project'
  | 'product'
  | 'expense'
  | 'vendor'
  | 'subcontractor'
  | 'team_member'
  | 'work_pack'
  | 'template';

export interface ActivityFilter {
  entity_type?: EntityType;
  action?: ActivityAction;
  user_id?: string;
  from_date?: string;
  to_date?: string;
  limit?: number;
  offset?: number;
}

export class ActivityLogService {
  private static channel: RealtimeChannel | null = null;
  
  static async checkRealtimeConfiguration(): Promise<{ enabled: boolean; error?: string }> {
    try {
      // Check if the activity_logs table is part of the realtime publication
      const { data, error } = await supabase
        .from('activity_logs')
        .select('id')
        .limit(1);
      
      if (error) {
        return { enabled: false, error: 'Cannot query activity_logs table' };
      }
      
      // Try to create a test subscription
      const testChannel = supabase
        .channel('test-realtime-' + Date.now())
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs'
        }, () => {})
        .subscribe();
      
      // Wait a bit and check status
      return new Promise((resolve) => {
        setTimeout(() => {
          const state = testChannel.state;
          supabase.removeChannel(testChannel);
          
          if (state === 'subscribed') {
            resolve({ enabled: true });
          } else {
            resolve({ 
              enabled: false, 
              error: `Real-time not enabled for activity_logs table. State: ${state}` 
            });
          }
        }, 2000);
      });
    } catch (error) {
      return { 
        enabled: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
  
  /**
   * Check if real-time is properly configured for the activity_logs table
   */
  static async checkRealtimeConfiguration(): Promise<{
    enabled: boolean;
    error?: string;
  }> {
    try {
      // Try to create a test channel to verify real-time is working
      const testChannel = supabase
        .channel('test-activity-logs')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'activity_logs'
          },
          () => {}
        );
      
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          supabase.removeChannel(testChannel);
          resolve({
            enabled: false,
            error: 'Real-time connection timeout. Please check if real-time is enabled for the activity_logs table in Supabase.'
          });
        }, 5000);
        
        testChannel.subscribe((status) => {
          clearTimeout(timeout);
          supabase.removeChannel(testChannel);
          
          if (status === 'SUBSCRIBED') {
            resolve({ enabled: true });
          } else if (status === 'CHANNEL_ERROR') {
            resolve({
              enabled: false,
              error: 'Channel error. Please verify real-time is enabled in Supabase dashboard.'
            });
          }
        });
      });
    } catch (error) {
      return {
        enabled: false,
        error: `Failed to check real-time configuration: ${error.message}`
      };
    }
  }

  static async logActivity(
    action: ActivityAction,
    entityType: EntityType,
    entityId?: string,
    entityName?: string,
    metadata: Record<string, any> = {}
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('log_activity', {
        p_action: action,
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_entity_name: entityName,
        p_metadata: metadata
      });

      if (error) {
        console.error('Error logging activity:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error logging activity:', error);
      return null;
    }
  }

  // Alias for backward compatibility
  static async log(params: {
    organizationId: string;
    entityType: EntityType;
    entityId?: string;
    action: ActivityAction | string;
    description?: string;
    metadata?: Record<string, any>;
  }): Promise<string | null> {
    // Extract entity name from description if available
    const entityName = params.description?.split(' ').slice(-1)[0];
    
    return this.logActivity(
      params.action as ActivityAction,
      params.entityType,
      params.entityId,
      entityName,
      params.metadata
    );
  }

  static buildDescription(
    action: string,
    entityType: string,
    entityName?: string,
    additionalInfo?: string
  ): string {
    const name = entityName || entityType;
    const base = `${action} ${name}`;
    return additionalInfo ? `${base} ${additionalInfo}` : base;
  }

  static async getActivities(filter: ActivityFilter = {}): Promise<ActivityLog[]> {
    try {
      console.log('Fetching activities with filter:', filter);
      
      let query = supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter.entity_type) {
        query = query.eq('entity_type', filter.entity_type);
      }

      if (filter.action) {
        query = query.eq('action', filter.action);
      }

      if (filter.user_id) {
        query = query.eq('user_id', filter.user_id);
      }

      if (filter.from_date) {
        query = query.gte('created_at', filter.from_date);
      }

      if (filter.to_date) {
        query = query.lte('created_at', filter.to_date);
      }

      if (filter.limit) {
        query = query.limit(filter.limit);
      }

      if (filter.offset) {
        query = query.range(filter.offset, filter.offset + (filter.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching activities:', error);
        return [];
      }

      console.log('Activities fetched:', data?.length || 0, 'results');
      
      // Fetch user data for activities with user_id
      if (data && data.length > 0) {
        const userIds = [...new Set(data.filter(a => a.user_id).map(a => a.user_id))];
        
        if (userIds.length > 0) {
          const { data: users } = await supabase
            .from('users')
            .select('id, email, name')
            .in('id', userIds);
            
          // Map user data to activities
          if (users) {
            const userMap = users.reduce((acc, user) => {
              acc[user.id] = {
                email: user.email,
                user_metadata: { full_name: user.name }
              };
              return acc;
            }, {} as Record<string, any>);
            
            data.forEach(activity => {
              if (activity.user_id && userMap[activity.user_id]) {
                activity.user = userMap[activity.user_id];
              }
            });
          }
        }
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching activities:', error);
      return [];
    }
  }

  static subscribeToActivities(
    callback: (activity: ActivityLog) => void,
    filter?: { organization_id?: string },
    options?: {
      onStatusChange?: (status: 'connecting' | 'connected' | 'disconnected' | 'error', error?: any) => void;
    }
  ): { unsubscribe: () => void; channel: RealtimeChannel } {
    // Unsubscribe from existing channel
    if (this.channel) {
      console.log('Removing existing channel...');
      supabase.removeChannel(this.channel);
      this.channel = null;
    }

    console.log('Creating real-time subscription with filter:', filter);

    // Create new channel with unique name
    const channelName = `activity-logs-${filter?.organization_id || 'all'}-${Date.now()}`;
    
    // Report connecting status
    options?.onStatusChange?.('connecting');
    
    this.channel = supabase
      .channel(channelName, {
        config: {
          presence: { key: 'activity-feed' },
          broadcast: { ack: true }
        }
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs',
          filter: filter?.organization_id ? `organization_id=eq.${filter.organization_id}` : undefined
        },
        async (payload) => {
          console.log('Real-time event received:', payload);
          
          try {
            // Fetch the complete activity
            const { data, error } = await supabase
              .from('activity_logs')
              .select('*')
              .eq('id', payload.new.id)
              .single();

            if (error) {
              console.error('Error fetching activity details:', error);
              return;
            }

            if (data) {
              // Fetch user data separately to avoid join issues
              if (data.user_id) {
                const { data: userInfo } = await supabase
                  .from('users')
                  .select('id, email, name')
                  .eq('id', data.user_id)
                  .single();
                  
                if (userInfo) {
                  data.user = {
                    email: userInfo.email,
                    user_metadata: { full_name: userInfo.name }
                  };
                }
              }
              
              callback(data);
            }
          } catch (err) {
            console.error('Error processing real-time activity:', err);
          }
        }
      )
      .subscribe((status, err) => {
        console.log('Subscription status:', status, 'Error:', err);
        
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to activity logs');
          options?.onStatusChange?.('connected');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Channel error:', err);
          options?.onStatusChange?.('error', err);
        } else if (status === 'TIMED_OUT') {
          console.error('Subscription timed out');
          options?.onStatusChange?.('error', new Error('Subscription timed out'));
        } else if (status === 'CLOSED') {
          console.log('Channel closed');
          options?.onStatusChange?.('disconnected');
        }
      });

    // Monitor connection state
    const checkConnection = setInterval(() => {
      if (this.channel) {
        const state = this.channel.state;
        console.log('Channel state:', state);
        
        if (state === 'closed' || state === 'errored') {
          options?.onStatusChange?.('disconnected');
        }
      }
    }, 30000); // Check every 30 seconds

    // Return unsubscribe function and channel
    return {
      unsubscribe: () => {
        console.log('Unsubscribing from activity logs...');
        clearInterval(checkConnection);
        
        if (this.channel) {
          supabase.removeChannel(this.channel);
          this.channel = null;
        }
      },
      channel: this.channel!
    };
  }

  static async exportActivities(filter: ActivityFilter = {}, format: 'csv' | 'json' = 'csv'): Promise<string> {
    const activities = await this.getActivities({ ...filter, limit: 10000 });

    if (format === 'json') {
      return JSON.stringify(activities, null, 2);
    }

    // CSV format
    const headers = ['Date', 'User', 'Action', 'Entity Type', 'Entity', 'Details'];
    const rows = activities.map(activity => [
      new Date(activity.created_at).toLocaleString(),
      activity.user?.user_metadata?.full_name || activity.user?.email || 'System',
      activity.action,
      activity.entity_type,
      activity.entity_name || activity.entity_id || '',
      JSON.stringify(activity.metadata)
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csv;
  }

  static getActivityDescription(activity: ActivityLog): string {
    const userName = activity.user?.user_metadata?.full_name || activity.user?.email || 'System';
    const entityName = activity.entity_name || `${activity.entity_type} #${activity.entity_id}`;

    const actionDescriptions: Record<string, string> = {
      created: `created ${entityName}`,
      updated: `updated ${entityName}`,
      deleted: `deleted ${entityName}`,
      sent: `sent ${entityName}`,
      paid: `marked ${entityName} as paid`,
      overdue: `marked ${entityName} as overdue`,
      converted: `converted ${entityName}`,
      signed: `signed ${entityName}`,
      viewed: `viewed ${entityName}`,
      downloaded: `downloaded ${entityName}`,
      shared: `shared ${entityName}`,
      archived: `archived ${entityName}`,
      restored: `restored ${entityName}`,
      invited: `invited ${entityName}`,
      removed: `removed ${entityName}`,
      completed: `completed ${entityName}`,
      cancelled: `cancelled ${entityName}`,
      approved: `approved ${entityName}`,
      rejected: `rejected ${entityName}`,
      status_changed: `changed status of ${entityName}`,
      payment_received: `received payment for ${entityName}`
    };

    return `${userName} ${actionDescriptions[activity.action] || activity.action}`;
  }

  static getActivityIcon(activity: ActivityLog): string {
    const iconMap: Record<string, string> = {
      created: 'Plus',
      updated: 'Edit',
      deleted: 'Trash2',
      sent: 'Send',
      paid: 'DollarSign',
      overdue: 'AlertCircle',
      converted: 'RefreshCw',
      signed: 'PenTool',
      viewed: 'Eye',
      downloaded: 'Download',
      shared: 'Share2',
      archived: 'Archive',
      restored: 'RotateCcw',
      invited: 'UserPlus',
      removed: 'UserMinus',
      completed: 'CheckCircle',
      cancelled: 'XCircle',
      approved: 'ThumbsUp',
      rejected: 'ThumbsDown',
      status_changed: 'RefreshCw',
      payment_received: 'DollarSign'
    };

    return iconMap[activity.action] || 'Activity';
  }

  static getActivityColor(activity: ActivityLog): string {
    const colorMap: Record<string, string> = {
      created: 'text-green-500',
      updated: 'text-blue-500',
      deleted: 'text-red-500',
      sent: 'text-purple-500',
      paid: 'text-green-600',
      overdue: 'text-orange-500',
      converted: 'text-indigo-500',
      signed: 'text-teal-500',
      viewed: 'text-gray-500',
      downloaded: 'text-cyan-500',
      shared: 'text-pink-500',
      archived: 'text-gray-600',
      restored: 'text-blue-600',
      invited: 'text-green-500',
      removed: 'text-red-600',
      completed: 'text-green-700',
      cancelled: 'text-red-700',
      approved: 'text-green-500',
      rejected: 'text-red-500',
      status_changed: 'text-yellow-500',
      payment_received: 'text-green-600'
    };

    return colorMap[activity.action] || 'text-gray-500';
  }
}