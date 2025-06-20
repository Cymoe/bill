-- Restructure line_items to be standard items tied to cost codes, not organizations
-- This properly handles RLS policies and data migration

-- First, drop existing RLS policies that depend on organization_id
DROP POLICY IF EXISTS "Users can view org line items" ON line_items;
DROP POLICY IF EXISTS "Org admins can manage line items" ON line_items;

-- Convert all organization-specific items to standard items
UPDATE line_items 
SET organization_id = NULL 
WHERE organization_id IS NOT NULL;

-- Drop the organization_id column
ALTER TABLE line_items 
DROP COLUMN IF EXISTS organization_id;

-- Drop the industry_id column - line items relate to cost codes only
ALTER TABLE line_items 
DROP COLUMN IF EXISTS industry_id;

-- Clean up any line items without cost codes
DELETE FROM line_items WHERE cost_code_id IS NULL;

-- Make cost_code_id required
ALTER TABLE line_items 
ALTER COLUMN cost_code_id SET NOT NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_line_items_cost_code_id ON line_items(cost_code_id);

-- Add unique constraint to prevent duplicate line items per cost code
-- First, let's clean up any existing duplicates by keeping only the first one
DELETE FROM line_items a
USING line_items b
WHERE a.id > b.id 
  AND a.cost_code_id = b.cost_code_id 
  AND a.name = b.name;

-- Now add the constraint
ALTER TABLE line_items 
ADD CONSTRAINT unique_line_item_per_cost_code UNIQUE (cost_code_id, name);

-- Create new RLS policies that allow users to view line items for cost codes in their industries
-- First, enable RLS if not already enabled
ALTER TABLE line_items ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view line items for cost codes in their organization's industries
CREATE POLICY "Users can view line items for their industries" ON line_items
  FOR SELECT
  USING (
    cost_code_id IN (
      SELECT cc.id
      FROM cost_codes cc
      WHERE cc.industry_id IN (
        -- Get all industries for user's organizations
        SELECT DISTINCT industry_id
        FROM (
          -- Primary industries
          SELECT o.industry_id
          FROM organizations o
          JOIN user_organizations uo ON o.id = uo.organization_id
          WHERE uo.user_id = auth.uid()
          AND o.industry_id IS NOT NULL
          
          UNION
          
          -- Additional industries
          SELECT oi.industry_id
          FROM organization_industries oi
          JOIN user_organizations uo ON oi.organization_id = uo.organization_id
          WHERE uo.user_id = auth.uid()
        ) all_industries
      )
    )
  );

-- Policy: System admins can manage all line items
CREATE POLICY "System admins can manage line items" ON line_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM user_profiles
      WHERE user_id = auth.uid()
      AND is_system_admin = true
    )
  );

-- Add comment explaining the new structure
COMMENT ON TABLE line_items IS 'Standard line items tied to cost codes. Each cost code has a set of standard line items that are available to all organizations using that cost code.';