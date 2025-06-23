-- Restructure line_items to be standard items tied to cost codes, not organizations
-- This removes the organization_id concept entirely

-- First, let's preserve any unique line items from organizations that don't exist as templates
-- We'll convert them to standard items
UPDATE line_items 
SET organization_id = NULL 
WHERE organization_id IS NOT NULL;

-- Now remove the organization_id column entirely
ALTER TABLE line_items 
DROP COLUMN IF EXISTS organization_id;

-- Remove the industry_id column as well - line items should be tied to cost codes only
-- The industry relationship comes through: line_item -> cost_code -> industry
ALTER TABLE line_items 
DROP COLUMN IF EXISTS industry_id;

-- Add an index on cost_code_id for better query performance
CREATE INDEX IF NOT EXISTS idx_line_items_cost_code_id ON line_items(cost_code_id);

-- Update any line items that might have null cost_code_id (cleanup)
DELETE FROM line_items WHERE cost_code_id IS NULL;

-- Make cost_code_id required
ALTER TABLE line_items 
ALTER COLUMN cost_code_id SET NOT NULL;

-- Add a unique constraint to prevent duplicate line items for the same cost code
-- This ensures we don't have multiple "2x4 Lumber" items for the same cost code
ALTER TABLE line_items 
ADD CONSTRAINT unique_line_item_per_cost_code UNIQUE (cost_code_id, name);