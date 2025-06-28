export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type JobOperationType = 'apply_pricing_mode' | 'undo_pricing' | 'bulk_update';

export interface PricingJob {
  id: string;
  organization_id: string;
  operation_type: JobOperationType;
  status: JobStatus;
  total_items: number;
  processed_items: number;
  failed_items: number;
  job_data: {
    mode_id?: string;
    mode_name?: string;
    line_item_ids?: string[];
    previous_prices?: Array<{ lineItemId: string; price: number }>;
    [key: string]: any;
  };
  result_summary?: {
    success_count: number;
    failed_count: number;
    failed_items?: Array<{
      line_item_id: string;
      name: string;
      error: string;
    }>;
  };
  error_message?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  updated_at: string;
  created_by?: string;
}

export interface JobProgress {
  current: number;
  total: number;
  failedCount?: number;
}

export interface CreateJobData {
  operation_type: JobOperationType;
  organization_id: string;
  total_items: number;
  job_data: Record<string, any>;
}

export interface JobQueue {
  createJob(data: CreateJobData): Promise<string>;
  getJob(jobId: string): Promise<PricingJob | null>;
  updateProgress(jobId: string, progress: JobProgress): Promise<void>;
  markAsProcessing(jobId: string): Promise<void>;
  markAsCompleted(jobId: string, resultSummary: PricingJob['result_summary']): Promise<void>;
  markAsFailed(jobId: string, error: string): Promise<void>;
  getActiveJobsForOrganization(organizationId: string): Promise<PricingJob[]>;
}