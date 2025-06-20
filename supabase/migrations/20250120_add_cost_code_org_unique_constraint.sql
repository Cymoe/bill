-- Add unique constraint to prevent duplicate cost codes within same organization
-- This allows the same code to exist for different organizations (including templates with org_id = NULL)

-- Drop the existing unique constraint on code alone if it exists
ALTER TABLE cost_codes DROP CONSTRAINT IF EXISTS unique_cost_code;

-- Add new unique constraint on (code, organization_id) combination
-- This allows:
-- 1. Multiple organizations to have the same code (e.g., "01.00")
-- 2. Templates (org_id = NULL) and org-specific codes to coexist
-- 3. Prevents duplicate codes within the same organization
ALTER TABLE cost_codes 
ADD CONSTRAINT unique_cost_code_per_org 
UNIQUE (code, organization_id);

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT unique_cost_code_per_org ON cost_codes IS 
'Ensures cost codes are unique within each organization. Templates (organization_id = NULL) and organization-specific codes can have the same code value.';