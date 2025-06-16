-- Add email tracking columns to invoices
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS sent_at timestamptz,
ADD COLUMN IF NOT EXISTS last_sent_at timestamptz,
ADD COLUMN IF NOT EXISTS send_count int DEFAULT 0,
ADD COLUMN IF NOT EXISTS email_opened_at timestamptz;

-- Add email tracking columns to estimates  
ALTER TABLE estimates
ADD COLUMN IF NOT EXISTS sent_at timestamptz,
ADD COLUMN IF NOT EXISTS last_sent_at timestamptz, 
ADD COLUMN IF NOT EXISTS send_count int DEFAULT 0,
ADD COLUMN IF NOT EXISTS email_opened_at timestamptz;

-- Create email_logs table for tracking all email communications
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type IN ('invoice', 'estimate')),
  entity_id uuid NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  organization_id uuid REFERENCES organizations(id),
  recipient_email text NOT NULL,
  cc_emails text[],
  subject text NOT NULL,
  status text NOT NULL CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
  sent_at timestamptz DEFAULT now(),
  delivered_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  error_message text,
  provider_message_id text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_logs_entity ON email_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_user ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_organization ON email_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);

-- Add RLS policies for email_logs
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own email logs
CREATE POLICY "Users can view their own email logs" ON email_logs
  FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own email logs
CREATE POLICY "Users can insert their own email logs" ON email_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Organization members can view organization email logs
CREATE POLICY "Organization members can view organization email logs" ON email_logs
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

-- Add comments
COMMENT ON TABLE email_logs IS 'Tracks all email communications sent from the system';
COMMENT ON COLUMN invoices.sent_at IS 'Timestamp when the invoice was first sent via email';
COMMENT ON COLUMN invoices.last_sent_at IS 'Timestamp of the most recent email send';
COMMENT ON COLUMN invoices.send_count IS 'Number of times the invoice has been sent';
COMMENT ON COLUMN invoices.email_opened_at IS 'Timestamp when the email was first opened by recipient';
COMMENT ON COLUMN estimates.sent_at IS 'Timestamp when the estimate was first sent via email';
COMMENT ON COLUMN estimates.last_sent_at IS 'Timestamp of the most recent email send';
COMMENT ON COLUMN estimates.send_count IS 'Number of times the estimate has been sent';
COMMENT ON COLUMN estimates.email_opened_at IS 'Timestamp when the email was first opened by recipient';