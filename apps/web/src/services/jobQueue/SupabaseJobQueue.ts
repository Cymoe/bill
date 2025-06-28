import { supabase } from '../../lib/supabase';
import { JobQueue, PricingJob, CreateJobData, JobProgress } from './types';

export class SupabaseJobQueue implements JobQueue {
  async createJob(data: CreateJobData): Promise<string> {
    const { data: job, error } = await supabase
      .from('pricing_jobs')
      .insert({
        organization_id: data.organization_id,
        operation_type: data.operation_type,
        total_items: data.total_items,
        job_data: data.job_data,
        status: 'pending'
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating job:', error);
      throw new Error('Failed to create job');
    }

    return job.id;
  }

  async getJob(jobId: string): Promise<PricingJob | null> {
    const { data, error } = await supabase
      .from('pricing_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) {
      console.error('Error fetching job:', error);
      return null;
    }

    return data as PricingJob;
  }

  async updateProgress(jobId: string, progress: JobProgress): Promise<void> {
    const updates: Record<string, any> = {
      processed_items: progress.current,
      updated_at: new Date().toISOString()
    };

    if (progress.failedCount !== undefined) {
      updates.failed_items = progress.failedCount;
    }

    const { error } = await supabase
      .from('pricing_jobs')
      .update(updates)
      .eq('id', jobId);

    if (error) {
      console.error('Error updating job progress:', error);
      console.error('Job ID:', jobId);
      console.error('Updates:', updates);
      throw error; // Throw to stop processing
    }
  }

  async markAsProcessing(jobId: string): Promise<void> {
    const { error } = await supabase
      .from('pricing_jobs')
      .update({
        status: 'processing',
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    if (error) {
      console.error('Error marking job as processing:', error);
      throw new Error('Failed to update job status');
    }
  }

  async markAsCompleted(
    jobId: string, 
    resultSummary: PricingJob['result_summary']
  ): Promise<void> {
    const { error } = await supabase
      .from('pricing_jobs')
      .update({
        status: 'completed',
        result_summary: resultSummary,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    if (error) {
      console.error('Error marking job as completed:', error);
      throw new Error('Failed to update job status');
    }
  }

  async markAsFailed(jobId: string, errorMessage: string): Promise<void> {
    const { error } = await supabase
      .from('pricing_jobs')
      .update({
        status: 'failed',
        error_message: errorMessage,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    if (error) {
      console.error('Error marking job as failed:', error);
      throw new Error('Failed to update job status');
    }
  }

  async getActiveJobsForOrganization(organizationId: string): Promise<PricingJob[]> {
    const { data, error } = await supabase
      .from('pricing_jobs')
      .select('*')
      .eq('organization_id', organizationId)
      .in('status', ['pending', 'processing'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active jobs:', error);
      return [];
    }

    return data as PricingJob[];
  }

  // Subscribe to job updates
  subscribeToJobUpdates(
    jobId: string, 
    onUpdate: (job: PricingJob) => void
  ): () => void {
    const subscription = supabase
      .channel(`job-${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pricing_jobs',
          filter: `id=eq.${jobId}`
        },
        (payload) => {
          onUpdate(payload.new as PricingJob);
        }
      )
      .subscribe();

    // Return cleanup function
    return () => {
      subscription.unsubscribe();
    };
  }
}