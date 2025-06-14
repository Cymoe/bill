-- Add organization_id to cost_codes table
-- Since cost_codes has unique constraints, we'll make them shared across organizations
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cost_codes' 
                   AND column_name = 'organization_id') THEN
        -- Add the column but allow NULL for shared cost codes
        ALTER TABLE cost_codes ADD COLUMN organization_id UUID REFERENCES organizations(id);
        
        -- Create index for performance
        CREATE INDEX idx_cost_codes_organization_id ON cost_codes(organization_id);
        
        -- Note: We're leaving organization_id as NULL for now
        -- This means cost codes are shared across all organizations
        -- If you want organization-specific cost codes later, you'll need to:
        -- 1. Drop the unique constraints
        -- 2. Add organization_id to the unique constraints
        -- 3. Duplicate the codes for each organization
    END IF;
END $$;