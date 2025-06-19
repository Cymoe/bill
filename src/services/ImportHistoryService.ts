import { supabase } from '../lib/supabase';
import { ActivityLogService } from './ActivityLogService';

export interface ImportHistory {
  id?: string;
  organization_id: string;
  user_id: string;
  import_type: 'clients' | 'vendors' | 'subcontractors' | 'team';
  import_method: 'manual' | 'csv' | 'magic_voice' | 'magic_paste' | 'magic_photo' | 'magic_email' | 'magic_calendar' | 'api';
  source_description: string;
  total_records: number;
  successful_imports: number;
  failed_imports: number;
  skipped_duplicates: number;
  merged_records: number;
  status: 'completed' | 'partial' | 'failed';
  error_details?: string;
  import_data?: any;
  created_at?: string;
}

export class ImportHistoryService {
  /**
   * Create a new import history record
   */
  static async create(history: Omit<ImportHistory, 'id' | 'created_at'>): Promise<ImportHistory> {
    const { data, error } = await supabase
      .from('import_history')
      .insert(history)
      .select()
      .single();

    if (error) {
      console.error('Error creating import history:', error);
      // Don't throw - import history is non-critical
      return history as ImportHistory;
    }

    // Log activity
    try {
      await ActivityLogService.log({
        organizationId: history.organization_id,
        entityType: history.import_type,
        entityId: data.id,
        action: 'imported',
        description: `imported ${history.successful_imports} ${history.import_type} via ${history.import_method}`,
        metadata: {
          source: history.source_description,
          total: history.total_records,
          successful: history.successful_imports,
          failed: history.failed_imports,
          duplicates: history.skipped_duplicates,
          merged: history.merged_records
        }
      });
    } catch (logError) {
      console.error('Failed to log import activity:', logError);
    }

    return data;
  }

  /**
   * Get import history for an organization
   */
  static async getHistory(
    organizationId: string, 
    options?: {
      import_type?: ImportHistory['import_type'];
      limit?: number;
      offset?: number;
    }
  ): Promise<ImportHistory[]> {
    let query = supabase
      .from('import_history')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (options?.import_type) {
      query = query.eq('import_type', options.import_type);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching import history:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get import statistics for an organization
   */
  static async getStatistics(organizationId: string): Promise<{
    total_imports: number;
    total_records: number;
    by_type: Record<string, number>;
    by_method: Record<string, number>;
    recent_imports: ImportHistory[];
  }> {
    const { data, error } = await supabase
      .from('import_history')
      .select('*')
      .eq('organization_id', organizationId);

    if (error || !data) {
      console.error('Error fetching import statistics:', error);
      return {
        total_imports: 0,
        total_records: 0,
        by_type: {},
        by_method: {},
        recent_imports: []
      };
    }

    const by_type: Record<string, number> = {};
    const by_method: Record<string, number> = {};
    let total_records = 0;

    data.forEach(record => {
      // By type
      by_type[record.import_type] = (by_type[record.import_type] || 0) + record.successful_imports;
      
      // By method
      by_method[record.import_method] = (by_method[record.import_method] || 0) + 1;
      
      // Total records
      total_records += record.successful_imports;
    });

    return {
      total_imports: data.length,
      total_records,
      by_type,
      by_method,
      recent_imports: data.slice(0, 5)
    };
  }

  /**
   * Track a Magic Import operation
   */
  static async trackMagicImport(
    organizationId: string,
    userId: string,
    method: 'voice' | 'paste' | 'photo' | 'email' | 'calendar',
    results: {
      total: number;
      imported: number;
      skipped: number;
      merged: number;
      source: string;
    }
  ): Promise<ImportHistory> {
    return this.create({
      organization_id: organizationId,
      user_id: userId,
      import_type: 'clients',
      import_method: `magic_${method}` as ImportHistory['import_method'],
      source_description: results.source,
      total_records: results.total,
      successful_imports: results.imported,
      failed_imports: 0,
      skipped_duplicates: results.skipped,
      merged_records: results.merged,
      status: results.imported > 0 ? 'completed' : 'failed'
    });
  }
}