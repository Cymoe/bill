-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(255),
  entity_name VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_activity_logs_organization_id ON activity_logs(organization_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);

-- Enable Row Level Security
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their organization's activity logs"
  ON activity_logs
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

-- Function to automatically log activities
CREATE OR REPLACE FUNCTION log_activity(
  p_action VARCHAR,
  p_entity_type VARCHAR,
  p_entity_id VARCHAR DEFAULT NULL,
  p_entity_name VARCHAR DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}',
  p_organization_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
  v_org_id UUID;
BEGIN
  -- Get organization_id if not provided
  IF p_organization_id IS NULL THEN
    SELECT organization_id INTO v_org_id
    FROM user_organizations
    WHERE user_id = auth.uid()
    LIMIT 1;
  ELSE
    v_org_id := p_organization_id;
  END IF;

  -- Insert activity log
  INSERT INTO activity_logs (
    organization_id,
    user_id,
    action,
    entity_type,
    entity_id,
    entity_name,
    metadata
  ) VALUES (
    v_org_id,
    auth.uid(),
    p_action,
    p_entity_type,
    p_entity_id,
    p_entity_name,
    p_metadata
  ) RETURNING id INTO v_activity_id;

  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION log_activity TO authenticated;