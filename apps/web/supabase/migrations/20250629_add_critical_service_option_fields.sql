-- Add critical fields to service_options table
BEGIN;

-- Add user_id for tracking who created the service option
ALTER TABLE service_options 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Add is_taxable for financial calculations
ALTER TABLE service_options 
ADD COLUMN is_taxable BOOLEAN DEFAULT true;

-- Add permit_required for compliance workflow
ALTER TABLE service_options 
ADD COLUMN permit_required BOOLEAN DEFAULT false;

-- Add requires_inspection for compliance workflow  
ALTER TABLE service_options 
ADD COLUMN requires_inspection BOOLEAN DEFAULT false;

-- Add minimum_quantity for business rule validation
ALTER TABLE service_options 
ADD COLUMN minimum_quantity NUMERIC(10,2);

-- Add maximum_quantity for business rule validation
ALTER TABLE service_options 
ADD COLUMN maximum_quantity NUMERIC(10,2);

-- Add check constraint to ensure min <= max when both are set
ALTER TABLE service_options 
ADD CONSTRAINT check_quantity_range 
CHECK (
  (minimum_quantity IS NULL OR maximum_quantity IS NULL) 
  OR (minimum_quantity <= maximum_quantity)
);

-- Create index on compliance fields for efficient filtering
CREATE INDEX idx_service_options_compliance 
ON service_options(permit_required, requires_inspection) 
WHERE permit_required = true OR requires_inspection = true;

-- Create index on user_id for RLS performance
CREATE INDEX idx_service_options_user_id 
ON service_options(user_id);

-- Update RLS policies to include user_id check
-- First, create a policy for users to manage their own custom service options
CREATE POLICY "Users can manage their own service options" ON service_options
FOR ALL 
TO authenticated
USING (
  -- Can see: shared options OR options from their organization OR their own options
  organization_id IS NULL 
  OR organization_id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid()
  )
  OR user_id = auth.uid()
)
WITH CHECK (
  -- Can create/update: only in their organization or as personal options
  organization_id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid()
  )
  OR (organization_id IS NULL AND user_id = auth.uid())
);

-- Migrate existing permit_required from attributes to new column
UPDATE service_options 
SET permit_required = true
WHERE attributes->>'permit_required' = 'true';

-- Clean up migrated data from attributes
UPDATE service_options 
SET attributes = attributes - 'permit_required'
WHERE attributes ? 'permit_required';

-- Add comment to table explaining the new fields
COMMENT ON COLUMN service_options.user_id IS 'User who created this service option (for custom options)';
COMMENT ON COLUMN service_options.is_taxable IS 'Whether this service is subject to sales tax';
COMMENT ON COLUMN service_options.permit_required IS 'Whether this service requires a permit';
COMMENT ON COLUMN service_options.requires_inspection IS 'Whether this service requires an inspection';
COMMENT ON COLUMN service_options.minimum_quantity IS 'Minimum quantity that can be ordered';
COMMENT ON COLUMN service_options.maximum_quantity IS 'Maximum quantity that can be ordered';

COMMIT;