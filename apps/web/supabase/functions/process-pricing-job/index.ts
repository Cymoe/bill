import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface JobData {
  mode_id: string;
  mode_name: string;
  line_item_ids?: string[];
  previous_prices?: Array<{ lineItemId: string; price: number }>;
  apply_to_all: boolean;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { jobId } = await req.json()
    
    if (!jobId) {
      throw new Error('Job ID is required')
    }

    // Create Supabase client with service role for full access
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get job details
    const { data: job, error: jobError } = await supabaseClient
      .from('pricing_jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      throw new Error(`Job not found: ${jobError?.message || 'Unknown error'}`)
    }

    if (job.status !== 'processing') {
      return new Response(
        JSON.stringify({ message: 'Job is not in processing state' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const jobData = job.job_data as JobData
    const organizationId = job.organization_id
    const modeId = jobData.mode_id

    // Get pricing mode details
    const { data: mode, error: modeError } = await supabaseClient
      .from('pricing_modes')
      .select('*')
      .eq('id', modeId)
      .single()

    if (modeError || !mode) {
      throw new Error(`Pricing mode not found: ${modeError?.message || 'Unknown error'}`)
    }

    // Determine which line items to update
    let lineItemQuery = supabaseClient
      .from('line_items')
      .select('*')
      .or(`organization_id.eq.${organizationId},organization_id.is.null`)

    if (jobData.line_item_ids && jobData.line_item_ids.length > 0) {
      lineItemQuery = lineItemQuery.in('id', jobData.line_item_ids)
    }

    const { data: lineItems, error: lineItemsError } = await lineItemQuery

    if (lineItemsError) {
      throw new Error(`Failed to fetch line items: ${lineItemsError.message}`)
    }

    const totalItems = lineItems?.length || 0
    let processedItems = 0
    let failedItems = 0
    const failedItemDetails: any[] = []

    // Special handling for Reset to Baseline
    if (mode.name === 'Reset to Baseline') {
      // Delete overrides for the selected items
      const deleteQuery = supabaseClient
        .from('line_item_overrides')
        .delete()
        .eq('organization_id', organizationId)

      if (jobData.line_item_ids && jobData.line_item_ids.length > 0) {
        deleteQuery.in('line_item_id', jobData.line_item_ids)
      }

      const { error: deleteError } = await deleteQuery

      if (deleteError) {
        failedItems = totalItems
        throw new Error(`Failed to reset to baseline: ${deleteError.message}`)
      }

      processedItems = totalItems
    } else {
      // Apply pricing mode in batches
      const batchSize = 50
      
      for (let i = 0; i < lineItems.length; i += batchSize) {
        const batch = lineItems.slice(i, i + batchSize)
        
        // Calculate new prices for each item
        const overrides = batch.map(item => {
          // Determine category based on cost code
          let category = 'all'
          if (item.cost_code?.code) {
            const codeNumber = parseInt(item.cost_code.code.replace(/[^0-9]/g, ''))
            if (!isNaN(codeNumber)) {
              if (codeNumber >= 100 && codeNumber <= 199) category = 'labor'
              else if (codeNumber >= 500 && codeNumber <= 599) category = 'materials'
              else if (codeNumber >= 200 && codeNumber <= 299) category = 'installation'
              else if ((codeNumber >= 300 && codeNumber <= 399) || (codeNumber >= 600 && codeNumber <= 699)) category = 'services'
              else if (codeNumber >= 400 && codeNumber <= 499) category = 'equipment'
              else if (codeNumber >= 700 && codeNumber <= 799) category = 'subcontractor'
            }
          }

          const multiplier = mode.adjustments[category] || mode.adjustments.all || 1
          const basePrice = item.base_price || item.price
          const newPrice = basePrice * multiplier

          return {
            organization_id: organizationId,
            line_item_id: item.id,
            custom_price: newPrice,
            applied_mode_id: modeId,
            mode_multiplier: multiplier,
            updated_at: new Date().toISOString()
          }
        })

        // Upsert the overrides
        const { error: upsertError, data: upsertedData } = await supabaseClient
          .from('line_item_overrides')
          .upsert(overrides, {
            onConflict: 'organization_id,line_item_id'
          })
          .select()

        if (upsertError) {
          console.error('Batch upsert error:', upsertError)
          failedItems += batch.length
          batch.forEach(item => {
            failedItemDetails.push({
              line_item_id: item.id,
              name: item.name,
              error: upsertError.message
            })
          })
        } else {
          processedItems += upsertedData?.length || 0
        }

        // Update progress
        await supabaseClient
          .from('pricing_jobs')
          .update({
            processed_items: processedItems,
            failed_items: failedItems,
            updated_at: new Date().toISOString()
          })
          .eq('id', jobId)
      }
    }

    // Mark job as completed
    const resultSummary = {
      success_count: processedItems,
      failed_count: failedItems,
      failed_items: failedItemDetails.length > 0 ? failedItemDetails : undefined
    }

    await supabaseClient
      .from('pricing_jobs')
      .update({
        status: failedItems === totalItems ? 'failed' : 'completed',
        result_summary: resultSummary,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId)

    return new Response(
      JSON.stringify({
        success: true,
        jobId,
        result: resultSummary
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error processing pricing job:', error)
    
    // Try to update job status to failed if we have a jobId
    if (req.method === 'POST') {
      try {
        const { jobId } = await req.json()
        if (jobId) {
          const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
          )
          
          await supabaseClient
            .from('pricing_jobs')
            .update({
              status: 'failed',
              error_message: error.message,
              completed_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', jobId)
        }
      } catch (updateError) {
        console.error('Failed to update job status:', updateError)
      }
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})