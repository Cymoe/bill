-- Add organization_id to bills table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bills' 
                   AND column_name = 'organization_id') THEN
        ALTER TABLE bills ADD COLUMN organization_id UUID REFERENCES organizations(id);
        
        -- Create index for performance
        CREATE INDEX idx_bills_organization_id ON bills(organization_id);
        
        -- Update existing bills with organization_id from user's default organization
        UPDATE bills b
        SET organization_id = (
            SELECT uo.organization_id 
            FROM user_organizations uo 
            WHERE uo.user_id = b.user_id 
            AND uo.is_default = true
            LIMIT 1
        )
        WHERE organization_id IS NULL;
    END IF;
END $$;

-- Update RLS policies for bills to use organization_id
DROP POLICY IF EXISTS "Users can view their own bills" ON bills;
CREATE POLICY "Users can view bills in their organizations" ON bills
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = bills.organization_id
      AND user_organizations.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create their own bills" ON bills;
CREATE POLICY "Users can create bills in their organizations" ON bills
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = bills.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin', 'member')
    )
  );

DROP POLICY IF EXISTS "Users can update their own bills" ON bills;
CREATE POLICY "Users can update bills in their organizations" ON bills
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = bills.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin', 'member')
    )
  );

DROP POLICY IF EXISTS "Users can delete their own bills" ON bills;
CREATE POLICY "Users can delete bills in their organizations" ON bills
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = bills.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin')
    )
  );