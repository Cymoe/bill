-- Final restructure of line_items to be standard items tied to cost codes
-- This preserves existing data and relationships

-- First, ensure we have an uncategorized cost code for General Construction
INSERT INTO cost_codes (id, code, name, industry_id, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '99-99',
  'Uncategorized',
  '5bf10848-8346-4860-aaf5-b7a0423c8119', -- General Construction
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- Update any line items without cost codes to use the uncategorized code
UPDATE line_items
SET cost_code_id = (
  SELECT id FROM cost_codes 
  WHERE code = '99-99' 
  AND industry_id = '5bf10848-8346-4860-aaf5-b7a0423c8119'
  LIMIT 1
)
WHERE cost_code_id IS NULL;

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view org line items" ON line_items;
DROP POLICY IF EXISTS "Org admins can manage line items" ON line_items;

-- Convert all organization-specific items to standard items
UPDATE line_items 
SET organization_id = NULL 
WHERE organization_id IS NOT NULL;

-- Create new RLS policies before dropping columns
ALTER TABLE line_items ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view line items for cost codes in their industries
CREATE POLICY "Users can view line items" ON line_items
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

-- Now we can safely drop the columns
ALTER TABLE line_items 
DROP COLUMN IF EXISTS organization_id;

ALTER TABLE line_items 
DROP COLUMN IF EXISTS industry_id;

-- Make cost_code_id required
ALTER TABLE line_items 
ALTER COLUMN cost_code_id SET NOT NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_line_items_cost_code_id ON line_items(cost_code_id);

-- Clean up exact duplicates (same name and cost code)
DELETE FROM line_items a
USING line_items b
WHERE a.id > b.id 
  AND a.cost_code_id = b.cost_code_id 
  AND a.name = b.name;

-- Add unique constraint
ALTER TABLE line_items 
ADD CONSTRAINT unique_line_item_per_cost_code UNIQUE (cost_code_id, name);

-- Add helpful comment
COMMENT ON TABLE line_items IS 'Standard line items tied to cost codes. Each cost code has a set of standard line items that are available to all organizations using that cost code.';