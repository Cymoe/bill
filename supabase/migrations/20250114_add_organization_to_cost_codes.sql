-- Add organization_id to cost_codes table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cost_codes' 
                   AND column_name = 'organization_id') THEN
        ALTER TABLE cost_codes ADD COLUMN organization_id UUID REFERENCES organizations(id);
        
        -- Create index for performance
        CREATE INDEX idx_cost_codes_organization_id ON cost_codes(organization_id);
        
        -- For cost codes, we need to duplicate them for each organization
        -- First, create a temporary table with the existing cost codes
        CREATE TEMP TABLE temp_cost_codes AS 
        SELECT * FROM cost_codes WHERE organization_id IS NULL;
        
        -- For each organization, create a copy of all cost codes
        INSERT INTO cost_codes (code, name, organization_id)
        SELECT 
            t.code, t.name, o.id
        FROM organizations o
        CROSS JOIN temp_cost_codes t;
        
        -- Delete the original records without organization_id
        DELETE FROM cost_codes WHERE organization_id IS NULL;
        
        -- Drop the temporary table
        DROP TABLE temp_cost_codes;
    END IF;
END $$;