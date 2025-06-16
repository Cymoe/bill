-- Create activity logs table for comprehensive user action tracking
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  entity_type text NOT NULL CHECK (entity_type IN (
    'invoice', 'estimate', 'client', 'project', 'product', 
    'payment', 'expense', 'team_member', 'subcontractor', 
    'vendor', 'work_pack', 'template'
  )),
  entity_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN (
    'created', 'updated', 'deleted', 'sent', 'opened', 
    'paid', 'accepted', 'rejected', 'converted', 'archived',
    'restored', 'signed', 'exported', 'imported', 'assigned',
    'unassigned', 'status_changed', 'milestone_completed'
  )),
  description text NOT NULL,
  metadata jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_activity_logs_org_created ON activity_logs(organization_id, created_at DESC);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Enable RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Organization members can view activity logs" ON activity_logs
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own activity logs" ON activity_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create a view for activity logs with user details
CREATE OR REPLACE VIEW activity_logs_with_users AS
SELECT 
  al.*,
  u.email as user_email,
  u.raw_user_meta_data->>'full_name' as user_name,
  u.raw_user_meta_data->>'avatar_url' as user_avatar
FROM activity_logs al
LEFT JOIN auth.users u ON al.user_id = u.id;

-- Grant access to the view
GRANT SELECT ON activity_logs_with_users TO authenticated;

-- Add function to get entity display name
CREATE OR REPLACE FUNCTION get_entity_display_name(
  p_entity_type text,
  p_entity_id uuid
) RETURNS text AS $$
DECLARE
  v_display_name text;
BEGIN
  CASE p_entity_type
    WHEN 'invoice' THEN
      SELECT invoice_number INTO v_display_name
      FROM invoices WHERE id = p_entity_id;
    WHEN 'estimate' THEN
      SELECT estimate_number INTO v_display_name
      FROM estimates WHERE id = p_entity_id;
    WHEN 'client' THEN
      SELECT name INTO v_display_name
      FROM clients WHERE id = p_entity_id;
    WHEN 'project' THEN
      SELECT name INTO v_display_name
      FROM projects WHERE id = p_entity_id;
    WHEN 'product' THEN
      SELECT name INTO v_display_name
      FROM products WHERE id = p_entity_id;
    ELSE
      v_display_name := p_entity_id::text;
  END CASE;
  
  RETURN COALESCE(v_display_name, 'Unknown');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments
COMMENT ON TABLE activity_logs IS 'Comprehensive audit trail of all user actions in the system';
COMMENT ON COLUMN activity_logs.entity_type IS 'Type of entity the action was performed on';
COMMENT ON COLUMN activity_logs.entity_id IS 'UUID of the specific entity';
COMMENT ON COLUMN activity_logs.action IS 'The action that was performed';
COMMENT ON COLUMN activity_logs.description IS 'Human-readable description of the action';
COMMENT ON COLUMN activity_logs.metadata IS 'Additional context like old values, changes, etc';