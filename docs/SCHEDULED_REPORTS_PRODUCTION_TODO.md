# Scheduled Reports & Export Feature - Production Requirements

## Overview
This document outlines the necessary steps to productionize the scheduled reports and export functionality currently implemented in the CategoryAnalytics component.

## Current Implementation Status
- ✅ Export to Excel functionality (client-side)
- ✅ Export to PDF functionality (client-side)  
- ✅ Scheduled Reports UI/Modal
- ⚠️ Scheduled Reports storage (currently using localStorage)
- ❌ Backend scheduled job execution
- ❌ Email delivery system
- ❌ Report generation service

## Production Requirements

### 1. Database Schema
Create the following tables in Supabase:

```sql
-- Scheduled reports configuration table
CREATE TABLE scheduled_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  report_type VARCHAR(10) CHECK (report_type IN ('excel', 'pdf')),
  frequency VARCHAR(10) CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  day_of_week SMALLINT CHECK (day_of_week >= 0 AND day_of_week <= 6),
  day_of_month SMALLINT CHECK (day_of_month >= 1 AND day_of_month <= 31),
  time TIME NOT NULL,
  date_range VARCHAR(20) NOT NULL,
  include_categories UUID[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report recipients table
CREATE TABLE scheduled_report_recipients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES scheduled_reports(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report execution history
CREATE TABLE scheduled_report_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES scheduled_reports(id) ON DELETE CASCADE,
  status VARCHAR(20) CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  file_url TEXT,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_scheduled_reports_user_id ON scheduled_reports(user_id);
CREATE INDEX idx_scheduled_reports_next_run_at ON scheduled_reports(next_run_at);
CREATE INDEX idx_scheduled_reports_is_active ON scheduled_reports(is_active);
CREATE INDEX idx_report_recipients_report_id ON scheduled_report_recipients(report_id);
CREATE INDEX idx_report_history_report_id ON scheduled_report_history(report_id);
```

### 2. Supabase Edge Functions

#### A. Report Scheduler Function
Create an edge function that runs on a cron schedule (every 5 minutes) to check for reports that need to be generated:

```typescript
// supabase/functions/schedule-reports/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Find reports that need to run
  const { data: reports } = await supabaseClient
    .from('scheduled_reports')
    .select('*')
    .eq('is_active', true)
    .lte('next_run_at', new Date().toISOString())
    .is('last_run_at', null)
    .or(`last_run_at.lt.${new Date().toISOString()}`)

  for (const report of reports || []) {
    // Queue report generation
    await supabaseClient.functions.invoke('generate-report', {
      body: { reportId: report.id }
    })

    // Update next_run_at based on frequency
    const nextRun = calculateNextRun(report)
    await supabaseClient
      .from('scheduled_reports')
      .update({ next_run_at: nextRun })
      .eq('id', report.id)
  }

  return new Response(JSON.stringify({ processed: reports?.length || 0 }))
})
```

#### B. Report Generator Function
Create an edge function that generates the actual report:

```typescript
// supabase/functions/generate-report/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as XLSX from 'https://cdn.sheetjs.com/xlsx-0.19.3/package/xlsx.mjs'
import { jsPDF } from 'https://esm.sh/jspdf@2.5.1'

serve(async (req) => {
  const { reportId } = await req.json()
  
  // 1. Fetch report configuration
  // 2. Generate report data based on configuration
  // 3. Create Excel or PDF file
  // 4. Upload to Supabase Storage
  // 5. Send email with download link
  // 6. Update report history
  
  return new Response(JSON.stringify({ success: true }))
})
```

### 3. Email Service Integration

#### Option A: SendGrid
```typescript
// Email sending with SendGrid
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendReportEmail = async (recipients: string[], reportUrl: string, reportName: string) => {
  const msg = {
    to: recipients,
    from: 'reports@yourcompany.com',
    subject: `Your scheduled report: ${reportName}`,
    html: `
      <h2>Your scheduled report is ready</h2>
      <p>Click the link below to download your report:</p>
      <a href="${reportUrl}">Download Report</a>
      <p>This link will expire in 7 days.</p>
    `,
  }
  
  await sgMail.sendMultiple(msg)
}
```

#### Option B: Resend
```typescript
// Email sending with Resend
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const sendReportEmail = async (recipients: string[], reportUrl: string, reportName: string) => {
  await resend.emails.send({
    from: 'reports@yourcompany.com',
    to: recipients,
    subject: `Your scheduled report: ${reportName}`,
    html: `...` // Same HTML as above
  })
}
```

### 4. Storage Configuration

Configure Supabase Storage bucket for report files:

```sql
-- Create storage bucket for reports
INSERT INTO storage.buckets (id, name, public) 
VALUES ('reports', 'reports', false);

-- Set up RLS policies for report access
CREATE POLICY "Users can view their own reports" ON storage.objects
FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM scheduled_reports 
    WHERE id = (storage.foldername(name)::uuid)
  )
);
```

### 5. Frontend Updates

Update the export utilities to use Supabase instead of localStorage:

```typescript
// src/utils/exportUtils.ts

export const saveScheduledReport = async (config: ScheduledReportConfig, userId: string) => {
  const { data: report, error } = await supabase
    .from('scheduled_reports')
    .insert({
      user_id: userId,
      name: config.name,
      report_type: config.type,
      frequency: config.frequency,
      day_of_week: config.dayOfWeek,
      day_of_month: config.dayOfMonth,
      time: config.time,
      date_range: config.dateRange,
      include_categories: config.includeCategories,
      is_active: config.isActive,
      next_run_at: calculateNextRun(config)
    })
    .select()
    .single()

  if (error) throw error

  // Insert recipients
  if (config.recipients.length > 0) {
    await supabase
      .from('scheduled_report_recipients')
      .insert(
        config.recipients.map(email => ({
          report_id: report.id,
          email
        }))
      )
  }

  return report
}

export const getScheduledReports = async (userId: string): Promise<ScheduledReportConfig[]> => {
  const { data, error } = await supabase
    .from('scheduled_reports')
    .select(`
      *,
      scheduled_report_recipients (email)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  
  return data.map(report => ({
    ...report,
    recipients: report.scheduled_report_recipients.map(r => r.email)
  }))
}
```

### 6. Environment Variables

Add the following to your `.env` file:

```bash
# Email Service (choose one)
SENDGRID_API_KEY=your_sendgrid_api_key
# OR
RESEND_API_KEY=your_resend_api_key

# Email Configuration
REPORTS_FROM_EMAIL=reports@yourcompany.com
REPORTS_REPLY_TO=support@yourcompany.com

# Storage
REPORTS_BUCKET=reports
REPORT_EXPIRY_DAYS=7
```

### 7. Monitoring & Error Handling

Implement monitoring for:
- Failed report generations
- Email delivery failures
- Storage quota usage
- Report generation performance

```typescript
// Add to report generation function
try {
  // Generate report...
} catch (error) {
  // Log to error tracking service (Sentry, LogRocket, etc.)
  await logError({
    error,
    context: {
      reportId,
      userId,
      reportType
    }
  })
  
  // Update report history with failure
  await supabase
    .from('scheduled_report_history')
    .insert({
      report_id: reportId,
      status: 'failed',
      error_message: error.message
    })
}
```

### 8. Security Considerations

1. **Rate Limiting**: Implement rate limits on report generation to prevent abuse
2. **File Size Limits**: Set maximum file sizes for generated reports
3. **Access Control**: Ensure users can only access their own reports
4. **Input Validation**: Validate all report configuration inputs
5. **Secure URLs**: Use signed URLs for report downloads with expiration

### 9. Performance Optimizations

1. **Queue System**: For large reports, implement a job queue (e.g., using Supabase Realtime or external service like BullMQ)
2. **Caching**: Cache frequently accessed data for report generation
3. **Pagination**: For large datasets, implement server-side pagination
4. **Compression**: Compress large report files before storage

### 10. Testing Requirements

1. **Unit Tests**: Test report generation logic
2. **Integration Tests**: Test email delivery and storage
3. **Load Tests**: Ensure system can handle multiple concurrent report generations
4. **E2E Tests**: Test complete flow from scheduling to delivery

## Implementation Priority

1. **Phase 1**: Database schema and basic CRUD operations
2. **Phase 2**: Report generation edge function (Excel only)
3. **Phase 3**: Email integration
4. **Phase 4**: PDF generation support
5. **Phase 5**: Monitoring and error handling
6. **Phase 6**: Performance optimizations

## Estimated Timeline

- Phase 1-2: 1 week
- Phase 3: 3 days
- Phase 4: 3 days
- Phase 5: 1 week
- Phase 6: 1 week

**Total: ~4 weeks for full production implementation**

## Additional Considerations

1. **Timezone Handling**: Ensure reports are generated in user's timezone
2. **Internationalization**: Support for multiple languages/locales
3. **Report Templates**: Allow users to create custom report templates
4. **API Access**: Provide API endpoints for programmatic report generation
5. **Audit Trail**: Log all report generations for compliance 