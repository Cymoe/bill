-- Create goals table for tracking revenue, profit, and project goals
CREATE TABLE goals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Goal configuration
  type text NOT NULL CHECK (type IN ('revenue', 'profit', 'projects', 'category_revenue')),
  category_id uuid REFERENCES project_categories(id) ON DELETE SET NULL,
  category_name text,
  target_value numeric(12,2) NOT NULL CHECK (target_value > 0),
  
  -- Time period
  period text NOT NULL CHECK (period IN ('monthly', 'quarterly', 'yearly')),
  year integer NOT NULL CHECK (year >= 2020 AND year <= 2030),
  month integer CHECK (month >= 1 AND month <= 12),
  quarter integer CHECK (quarter >= 1 AND quarter <= 4),
  
  -- Metadata
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  
  -- Constraints
  CONSTRAINT goals_monthly_requires_month CHECK (
    (period = 'monthly' AND month IS NOT NULL) OR 
    (period != 'monthly')
  ),
  CONSTRAINT goals_quarterly_requires_quarter CHECK (
    (period = 'quarterly' AND quarter IS NOT NULL) OR 
    (period != 'quarterly')
  ),
  CONSTRAINT goals_category_revenue_requires_category CHECK (
    (type = 'category_revenue' AND category_id IS NOT NULL) OR 
    (type != 'category_revenue')
  ),
  
  -- Unique constraint to prevent duplicate goals for same period
  UNIQUE (organization_id, type, category_id, period, year, month, quarter)
);

-- Create indexes for performance
CREATE INDEX goals_organization_id_idx ON goals(organization_id);
CREATE INDEX goals_user_id_idx ON goals(user_id);
CREATE INDEX goals_period_idx ON goals(organization_id, period, year, month, quarter);
CREATE INDEX goals_type_idx ON goals(organization_id, type);

-- Enable RLS
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can only access goals from their organization" ON goals
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );